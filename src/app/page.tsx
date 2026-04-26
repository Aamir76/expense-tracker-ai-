'use client';

import { useState, useEffect } from 'react';
import { Expense, ExpenseFilters } from '@/types/expense';
import { storage } from '@/lib/storage';
import { filterExpenses, calculateExpenseSummary } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

import Header from '@/components/Header';
import Dashboard from '@/components/Dashboard';
import ExpenseForm from '@/components/ExpenseForm';
import ExpenseFiltersComponent from '@/components/ExpenseFilters';
import ExpenseList from '@/components/ExpenseList';
import UnifiedExportInterface from '@/components/UnifiedExportInterface';
import DatabaseStatus from '@/components/DatabaseStatus';
import AuthGuard from '@/components/AuthGuard';
import Settings from '@/components/Settings';
import LoadingSkeleton from '@/components/LoadingSkeleton';

function HomeContent() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'expenses' | 'settings'>('dashboard');
  const [filters, setFilters] = useState<ExpenseFilters>({});
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // HomeContent only renders when AuthGuard confirms user + profile are set,
    // but guard here defensively so a stale render never fires an unauthed query.
    if (!user) {
      setIsLoading(false);
      return;
    }

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
  }, [user?.id]); // re-run if the authenticated user identity changes

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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <Header currentPage={currentPage} onPageChange={setCurrentPage} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingSkeleton variant="dashboard" />
        </main>
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
            <Dashboard summary={summary} recentExpenses={recentExpenses} onNavigateToSettings={() => setCurrentPage('settings')} />
          </div>
        ) : currentPage === 'settings' ? (
          <div>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your account and preferences</p>
            </div>
            <Settings expenses={expenses} />
          </div>
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

export default function Home() {
  return (
    <AuthGuard>
      <HomeContent />
    </AuthGuard>
  );
}