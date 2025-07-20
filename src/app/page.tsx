'use client';

import { useState, useEffect } from 'react';
import { Expense, ExpenseFilters } from '@/types/expense';
import { storage } from '@/lib/storage';
import { filterExpenses, calculateExpenseSummary } from '@/lib/utils';

import Header from '@/components/Header';
import Dashboard from '@/components/Dashboard';
import ExpenseForm from '@/components/ExpenseForm';
import ExpenseFiltersComponent from '@/components/ExpenseFilters';
import ExpenseList from '@/components/ExpenseList';
import CloudExportWorkspace from '@/components/CloudExportWorkspace';

export default function Home() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'expenses'>('dashboard');
  const [filters, setFilters] = useState<ExpenseFilters>({});
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCloudExportOpen, setIsCloudExportOpen] = useState(false);

  useEffect(() => {
    const loadExpenses = () => {
      try {
        const savedExpenses = storage.getExpenses();
        setExpenses(savedExpenses);
      } catch (error) {
        console.error('Error loading expenses:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadExpenses();
  }, []);

  const handleAddExpense = (expense: Expense) => {
    try {
      storage.addExpense(expense);
      setExpenses(prev => [...prev, expense]);
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  const handleUpdateExpense = (updatedExpense: Expense) => {
    try {
      storage.updateExpense(updatedExpense);
      setExpenses(prev => 
        prev.map(expense => expense.id === updatedExpense.id ? updatedExpense : expense)
      );
      setEditingExpense(null);
    } catch (error) {
      console.error('Error updating expense:', error);
    }
  };

  const handleDeleteExpense = (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        storage.deleteExpense(id);
        setExpenses(prev => prev.filter(expense => expense.id !== id));
      } catch (error) {
        console.error('Error deleting expense:', error);
      }
    }
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
  };

  const handleCancelEdit = () => {
    setEditingExpense(null);
  };


  const filteredExpenses = filterExpenses(expenses, filters);
  const summary = calculateExpenseSummary(expenses);
  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentPage={currentPage} onPageChange={setCurrentPage} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentPage === 'dashboard' ? (
          <div>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-2">Overview of your expenses and spending patterns</p>
            </div>
            <Dashboard summary={summary} recentExpenses={recentExpenses} />
          </div>
        ) : (
          <div>
            <div className="mb-8 flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Expenses</h1>
                <p className="text-gray-600 mt-2">Manage your expenses and track spending</p>
              </div>
              {expenses.length > 0 && (
                <button
                  onClick={() => setIsCloudExportOpen(true)}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 flex items-center space-x-2 font-medium shadow-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                  <span>Cloud Export Hub</span>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                </button>
              )}
            </div>

            <div className="space-y-6">
              <ExpenseForm
                onSubmit={editingExpense ? handleUpdateExpense : handleAddExpense}
                initialData={editingExpense || undefined}
                onCancel={editingExpense ? handleCancelEdit : undefined}
              />

              <ExpenseFiltersComponent
                filters={filters}
                onFiltersChange={setFilters}
              />

              <ExpenseList
                expenses={filteredExpenses}
                onEdit={handleEditExpense}
                onDelete={handleDeleteExpense}
              />
            </div>
          </div>
        )}
      </main>

      <CloudExportWorkspace
        isOpen={isCloudExportOpen}
        onClose={() => setIsCloudExportOpen(false)}
        expenses={expenses}
      />
    </div>
  );
}