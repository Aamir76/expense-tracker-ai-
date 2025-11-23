'use client';

import { Expense, ExpenseSummary } from '@/types/expense';
import { formatCurrency } from '@/lib/utils';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface MonthlyInsightsProps {
  expenses: Expense[];
  summary: ExpenseSummary;
}

export default function MonthlyInsights({ expenses, summary }: MonthlyInsightsProps) {
  // Get current month's expenses
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthlyExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
  });

  // Calculate monthly category totals
  const monthlyCategoryTotals = monthlyExpenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  // Prepare data for donut chart
  const chartData = Object.entries(monthlyCategoryTotals)
    .filter(([_, amount]) => amount > 0)
    .map(([category, amount]) => ({
      name: category,
      value: amount,
      color: getCategoryColor(category)
    }));

  // Get top 3 categories for the breakdown
  const topCategories = Object.entries(monthlyCategoryTotals)
    .filter(([_, amount]) => amount > 0)
    .sort(([_, a], [__, b]) => b - a)
    .slice(0, 3);

  // Calculate budget streak (mock calculation - you can enhance this)
  const budgetStreak = calculateBudgetStreak(monthlyExpenses);

  function getCategoryColor(category: string): string {
    const colors: Record<string, string> = {
      Food: '#ef4444',           // Red
      Transportation: '#06b6d4', // Cyan  
      Entertainment: '#3b82f6',  // Blue
      Shopping: '#f59e0b',       // Amber
      Bills: '#10b981',          // Emerald
      Other: '#6b7280'           // Gray
    };
    return colors[category] || colors.Other;
  }

  function getCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
      Food: '🍔',
      Transportation: '🚗',
      Entertainment: '🎬',
      Shopping: '🛍️',
      Bills: '📄',
      Other: '📦'
    };
    return icons[category] || icons.Other;
  }

  function calculateBudgetStreak(expenses: Expense[]): number {
    // Simple mock calculation - days since last expense over $50
    // You can enhance this based on your budget logic
    const today = new Date();
    const expensesOverBudget = expenses.filter(e => e.amount > 50);
    
    if (expensesOverBudget.length === 0) {
      return Math.floor((today.getTime() - new Date(today.getFullYear(), today.getMonth(), 1).getTime()) / (1000 * 60 * 60 * 24));
    }
    
    const lastOverBudget = expensesOverBudget
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    
    const daysSince = Math.floor((today.getTime() - new Date(lastOverBudget.date).getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, daysSince);
  }

  const totalMonthly = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-auto" style={{ 
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      border: '1px solid #e2e8f0'
    }}>
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Monthly Insights</h2>
        <div className="w-16 h-0.5 bg-gray-300 mx-auto"></div>
      </div>

      {/* Donut Chart */}
      <div className="relative mb-8">
        <div className="h-64 w-64 mx-auto">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Center label */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center bg-white rounded-full px-4 py-2 shadow-md">
            <div className="text-lg font-semibold text-gray-700">Spending</div>
          </div>
        </div>
        
        {/* Donut chart label */}
        <div className="absolute top-4 right-8 transform rotate-12">
          <div className="bg-white px-2 py-1 rounded shadow-sm border border-gray-200">
            <span className="text-sm text-gray-600 italic">donut chart!</span>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="space-y-4 mb-8">
        {topCategories.map(([category, amount]) => (
          <div key={category} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div 
                className="w-4 h-4 rounded-sm"
                style={{ backgroundColor: getCategoryColor(category) }}
              ></div>
              <span className="text-gray-700 font-medium">
                {getCategoryIcon(category)} {category}: {formatCurrency(amount)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Top 3 indicator */}
      <div className="flex justify-end mb-6">
        <div className="text-sm text-gray-500">
          <span className="italic">Top 3!</span>
          <div className="w-8 h-0.5 bg-gray-300 mt-1"></div>
        </div>
      </div>

      {/* Budget Streak */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Budget Streak</h3>
        <div className="text-4xl font-bold text-green-600 mb-2">{budgetStreak}</div>
        <div className="text-gray-600">days!</div>
        
        {/* Progress bar */}
        <div className="mt-4 w-20 h-3 bg-gray-200 rounded-full mx-auto overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-gray-300 to-gray-400 rounded-full"
            style={{ 
              background: 'repeating-linear-gradient(45deg, #d1d5db, #d1d5db 4px, #9ca3af 4px, #9ca3af 8px)',
              width: '75%'
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}