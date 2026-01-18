'use client';

import { ExpenseSummary, Expense } from '@/types/expense';
import { formatCurrency } from '@/lib/utils';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useAuth } from '@/contexts/AuthContext';
import BudgetBar from './BudgetBar';

interface DashboardProps {
  summary: ExpenseSummary;
  recentExpenses: Expense[];
  onNavigateToSettings?: () => void;
}

export default function Dashboard({ summary, recentExpenses, onNavigateToSettings }: DashboardProps) {
  const { currency } = useCurrency();
  const { profile } = useAuth();
  const topCategories = Object.entries(summary.categoryTotals)
    .filter(([_, amount]) => amount > 0)
    .sort(([_, a], [__, b]) => b - a)
    .slice(0, 3);

  const getCategoryColor = (category: string) => {
    const colors = {
      Food: 'bg-orange-500',
      Transportation: 'bg-blue-500',
      Entertainment: 'bg-purple-500',
      Shopping: 'bg-pink-500',
      Bills: 'bg-red-500',
      Other: 'bg-gray-500'
    };
    return colors[category as keyof typeof colors] || colors.Other;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Expenses</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(summary.totalExpenses, currency)}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">This Month</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(summary.monthlyTotal, currency)}</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
              <span className="text-2xl">📅</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.expenseCount}</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
              <span className="text-2xl">📊</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg per Transaction</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(summary.expenseCount > 0 ? summary.totalExpenses / summary.expenseCount : 0, currency)}
              </p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-full">
              <span className="text-2xl">📈</span>
            </div>
          </div>
        </div>
      </div>

      {/* Budget Bar */}
      <BudgetBar
        budget={profile?.monthly_budget ?? null}
        spent={summary.monthlyTotal}
        onEditClick={onNavigateToSettings}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Categories</h3>
          {topCategories.length > 0 ? (
            <div className="space-y-4">
              {topCategories.map(([category, amount]) => {
                const percentage = summary.totalExpenses > 0 ? (amount / summary.totalExpenses) * 100 : 0;
                return (
                  <div key={category}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{category}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{formatCurrency(amount, currency)}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getCategoryColor(category)}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{percentage.toFixed(1)}% of total</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-gray-500 dark:text-gray-400 text-center py-4">
              No expenses yet. Add some expenses to see category breakdown.
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Expenses</h3>
          {recentExpenses.length > 0 ? (
            <div className="space-y-3">
              {recentExpenses.slice(0, 5).map((expense) => (
                <div key={expense.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white truncate max-w-40">{expense.description}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{expense.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(expense.amount, currency)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(expense.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 dark:text-gray-400 text-center py-4">
              No recent expenses to show.
            </div>
          )}
        </div>
      </div>

      {summary.totalExpenses > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Spending Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(summary.categoryTotals).map(([category, amount]) => (
              <div key={category} className="text-center">
                <div className={`w-16 h-16 mx-auto rounded-full ${getCategoryColor(category)} flex items-center justify-center mb-2`}>
                  <span className="text-white font-bold text-lg">
                    {category.charAt(0)}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{category}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{formatCurrency(amount, currency)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}