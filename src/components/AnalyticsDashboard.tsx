'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import {
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Target,
  AlertCircle,
  Filter,
  Download,
  Maximize,
  RefreshCw
} from 'lucide-react';
import { Expense, ExpenseCategory } from '../types/expense';
import { exportSystemV4 } from '../lib/export-system-v4';

interface AnalyticsDashboardProps {
  expenses: Expense[];
}

interface ChartData {
  name: string;
  value: number;
  amount?: number;
  category?: string;
  date?: string;
}

interface InsightCard {
  id: string;
  title: string;
  value: string;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ComponentType<any>;
  color: string;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ expenses }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedCategories, setSelectedCategories] = useState<ExpenseCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316'];

  // Filter expenses based on selected period
  const filteredExpenses = useMemo(() => {
    const now = new Date();
    const cutoffDate = new Date();
    
    switch (selectedPeriod) {
      case '7d':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        cutoffDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        cutoffDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    let filtered = expenses.filter(expense => new Date(expense.date) >= cutoffDate);
    
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(expense => selectedCategories.includes(expense.category));
    }

    return filtered;
  }, [expenses, selectedPeriod, selectedCategories]);

  // Calculate insights
  const insights = useMemo(() => {
    const totalSpent = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const avgPerDay = totalSpent / (selectedPeriod === '7d' ? 7 : selectedPeriod === '30d' ? 30 : selectedPeriod === '90d' ? 90 : 365);
    const expenseCount = filteredExpenses.length;
    const avgPerTransaction = expenseCount > 0 ? totalSpent / expenseCount : 0;

    // Calculate trends (mock implementation)
    const previousPeriodExpenses = expenses.slice(0, Math.floor(expenses.length / 2));
    const currentPeriodExpenses = expenses.slice(Math.floor(expenses.length / 2));
    
    const previousTotal = previousPeriodExpenses.reduce((sum, e) => sum + e.amount, 0);
    const currentTotal = currentPeriodExpenses.reduce((sum, e) => sum + e.amount, 0);
    const spendingChange = previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal) * 100 : 0;

    const cards: InsightCard[] = [
      {
        id: 'total-spent',
        title: 'Total Spent',
        value: `$${totalSpent.toFixed(2)}`,
        change: spendingChange,
        trend: spendingChange > 0 ? 'up' : spendingChange < 0 ? 'down' : 'stable',
        icon: DollarSign,
        color: 'blue'
      },
      {
        id: 'avg-daily',
        title: 'Avg per Day',
        value: `$${avgPerDay.toFixed(2)}`,
        change: Math.random() * 20 - 10, // Mock change
        trend: Math.random() > 0.5 ? 'up' : 'down',
        icon: Calendar,
        color: 'green'
      },
      {
        id: 'transactions',
        title: 'Transactions',
        value: expenseCount.toString(),
        change: Math.random() * 15 - 7.5, // Mock change
        trend: Math.random() > 0.5 ? 'up' : 'down',
        icon: Target,
        color: 'purple'
      },
      {
        id: 'avg-transaction',
        title: 'Avg per Transaction',
        value: `$${avgPerTransaction.toFixed(2)}`,
        change: Math.random() * 25 - 12.5, // Mock change
        trend: Math.random() > 0.5 ? 'up' : 'down',
        icon: TrendingUp,
        color: 'orange'
      }
    ];

    return cards;
  }, [filteredExpenses, selectedPeriod, expenses]);

  // Prepare chart data
  const categoryData = useMemo(() => {
    const categoryTotals = filteredExpenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<ExpenseCategory, number>);

    return Object.entries(categoryTotals).map(([category, amount]) => ({
      name: category,
      value: amount,
      amount
    }));
  }, [filteredExpenses]);

  const trendData = useMemo(() => {
    const dailyTotals = filteredExpenses.reduce((acc, expense) => {
      const date = expense.date.split('T')[0]; // Get date part only
      acc[date] = (acc[date] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(dailyTotals)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, amount]) => ({
        name: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: amount,
        date
      }));
  }, [filteredExpenses]);

  const handleRefresh = async () => {
    setIsLoading(true);
    setRefreshKey(prev => prev + 1);
    
    try {
      // Simulate analytics refresh
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate fresh analytics
      await exportSystemV4.getAnalytics().generateInsights(filteredExpenses);
    } catch (error) {
      console.error('Failed to refresh analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportAnalytics = async () => {
    try {
      const analyticsData = {
        period: selectedPeriod,
        insights,
        categoryBreakdown: categoryData,
        trendData,
        totalExpenses: filteredExpenses.length,
        totalAmount: filteredExpenses.reduce((sum, e) => sum + e.amount, 0),
        generatedAt: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(analyticsData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `expense-analytics-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export analytics:', error);
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-green-500" />;
      default:
        return <div className="w-4 h-4" />;
    }
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-red-600';
    if (change < 0) return 'text-green-600';
    return 'text-gray-600';
  };

  return (
    <div className="space-y-6" key={refreshKey}>
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value=""
              onChange={(e) => {
                if (e.target.value && !selectedCategories.includes(e.target.value as ExpenseCategory)) {
                  setSelectedCategories([...selectedCategories, e.target.value as ExpenseCategory]);
                }
              }}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Add category filter</option>
              <option value="Food">Food</option>
              <option value="Transportation">Transportation</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Shopping">Shopping</option>
              <option value="Bills">Bills</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center space-x-2 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          
          <button
            onClick={handleExportAnalytics}
            className="flex items-center space-x-2 px-3 py-1 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Category Filters */}
      {selectedCategories.length > 0 && (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Filtered by:</span>
          {selectedCategories.map((category) => (
            <span
              key={category}
              className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
            >
              {category}
              <button
                onClick={() => setSelectedCategories(selectedCategories.filter(c => c !== category))}
                className="ml-1 hover:text-blue-900"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {insights.map((insight, index) => (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-6 rounded-lg border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{insight.title}</p>
                <p className="text-2xl font-bold text-gray-900">{insight.value}</p>
                <div className="flex items-center space-x-1 mt-1">
                  {getTrendIcon(insight.trend)}
                  <span className={`text-sm ${getChangeColor(insight.change)}`}>
                    {insight.change > 0 ? '+' : ''}{insight.change.toFixed(1)}%
                  </span>
                </div>
              </div>
              <insight.icon className={`h-8 w-8 text-${insight.color}-500`} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-6 rounded-lg border border-gray-200"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Spending by Category</h3>
            <Maximize className="w-4 h-4 text-gray-400" />
          </div>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Amount']} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                <p>No data available for selected period</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Spending Trend */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-6 rounded-lg border border-gray-200"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Spending Trend</h3>
            <Maximize className="w-4 h-4 text-gray-400" />
          </div>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Amount']} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                <p>No trend data available</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Category Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-lg border border-gray-200"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Details</h3>
        {categoryData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Total Spent']} />
              <Bar dataKey="value" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <AlertCircle className="w-8 h-8 mx-auto mb-2" />
              <p>No category data available</p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Advanced Analytics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-gray-200"
      >
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Advanced Analytics</h3>
          <p className="text-gray-600 mb-4">
            Unlock deeper insights with AI-powered predictions, anomaly detection, and custom reports.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
              Predictive Analytics
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
              Anomaly Detection
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-green-100 text-green-800">
              Custom Reports
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};