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
import UnifiedExportInterface from '@/components/UnifiedExportInterface';
import { ExportSystemV4 } from '@/components/ExportSystemV4';
import MonthlyInsights from '@/components/MonthlyInsights';
import DatabaseStatus from '@/components/DatabaseStatus';

export default function Home() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'expenses' | 'export-v4' | 'insights'>('dashboard');
  const [filters, setFilters] = useState<ExpenseFilters>({});
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadExpenses = async () => {
      try {
        const savedExpenses = await storage.getExpenses();
        setExpenses(savedExpenses);
      } catch (error) {
        console.error('Error loading expenses:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadExpenses();
  }, []);

  const handleAddExpense = async (expense: Expense) => {
    try {
      const addedExpense = await storage.addExpense(expense);
      setExpenses(prev => [...prev, addedExpense]);
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  const handleUpdateExpense = async (updatedExpense: Expense) => {
    try {
      const updated = await storage.updateExpense(updatedExpense);
      setExpenses(prev =>
        prev.map(expense => expense.id === updated.id ? updated : expense)
      );
      setEditingExpense(null);
    } catch (error) {
      console.error('Error updating expense:', error);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await storage.deleteExpense(id);
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Header currentPage={currentPage} onPageChange={setCurrentPage} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentPage === 'dashboard' ? (
          <div>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Overview of your expenses and spending patterns</p>
            </div>
            <Dashboard summary={summary} recentExpenses={recentExpenses} />
          </div>
        ) : currentPage === 'insights' ? (
          <div>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Monthly Insights</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Visual breakdown of your spending patterns and budget tracking</p>
            </div>
            <MonthlyInsights expenses={expenses} summary={summary} />
          </div>
        ) : currentPage === 'export-v4' ? (
          <ExportSystemV4
            expenses={expenses}
            onExportComplete={(job) => {
              console.log('Export completed:', job);
            }}
          />
        ) : (
          <div>
            <div className="mb-8 flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Expenses</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your expenses and track spending</p>
              </div>
              {expenses.length > 0 && (
                <UnifiedExportInterface
                  expenses={expenses}
                  filteredExpenses={filteredExpenses}
                />
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

      <DatabaseStatus />
    </div>
  );
}