'use client';

import { ExpenseSummary, Expense } from '@/types/expense';
import { formatCurrency } from '@/lib/utils';

interface DashboardProps {
  summary: ExpenseSummary;
  recentExpenses: Expense[];
}

export default function Dashboard({ summary, recentExpenses }: DashboardProps) {
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
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.totalExpenses)}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.monthlyTotal)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <span className="text-2xl">📅</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-900">{summary.expenseCount}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <span className="text-2xl">📊</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg per Transaction</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(summary.expenseCount > 0 ? summary.totalExpenses / summary.expenseCount : 0)}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <span className="text-2xl">📈</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Categories</h3>
          {topCategories.length > 0 ? (
            <div className="space-y-4">
              {topCategories.map(([category, amount]) => {
                const percentage = summary.totalExpenses > 0 ? (amount / summary.totalExpenses) * 100 : 0;
                return (
                  <div key={category}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">{category}</span>
                      <span className="text-sm text-gray-600">{formatCurrency(amount)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getCategoryColor(category)}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{percentage.toFixed(1)}% of total</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-gray-500 text-center py-4">
              No expenses yet. Add some expenses to see category breakdown.
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Expenses</h3>
          {recentExpenses.length > 0 ? (
            <div className="space-y-3">
              {recentExpenses.slice(0, 5).map((expense) => (
                <div key={expense.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 truncate max-w-40">{expense.description}</p>
                    <p className="text-sm text-gray-500">{expense.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatCurrency(expense.amount)}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(expense.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-center py-4">
              No recent expenses to show.
            </div>
          )}
        </div>
      </div>

      {summary.totalExpenses > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(summary.categoryTotals).map(([category, amount]) => (
              <div key={category} className="text-center">
                <div className={`w-16 h-16 mx-auto rounded-full ${getCategoryColor(category)} flex items-center justify-center mb-2`}>
                  <span className="text-white font-bold text-lg">
                    {category.charAt(0)}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-700">{category}</p>
                <p className="text-xs text-gray-500">{formatCurrency(amount)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}