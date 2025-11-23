'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  Target,
  Calendar,
  DollarSign,
  PieChart,
  BarChart3,
  Settings,
  RefreshCw,
  Check,
  X,
  ChevronRight,
  Star,
  Filter,
  Download
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Expense, ExpenseCategory } from '../types/expense';
import { AIInsight, AIAction } from '../types/export-v4';
import { exportSystemV4 } from '../lib/export-system-v4';

interface AIInsightsPanelProps {
  insights: AIInsight[];
  expenses: Expense[];
}

interface PredictiveModel {
  id: string;
  name: string;
  accuracy: number;
  lastTrained: string;
  predictions: {
    nextMonthSpending: number;
    categoryPredictions: { category: ExpenseCategory; amount: number; confidence: number }[];
    savingsOpportunities: { description: string; potentialSavings: number }[];
  };
}

interface AnomalyAlert {
  id: string;
  type: 'amount' | 'frequency' | 'pattern';
  severity: 'low' | 'medium' | 'high';
  description: string;
  expense?: Expense;
  recommendation: string;
  confidence: number;
}

export const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({ insights: initialInsights, expenses }) => {
  const [insights, setInsights] = useState(initialInsights);
  const [activeTab, setActiveTab] = useState<'overview' | 'predictions' | 'anomalies' | 'recommendations' | 'automation'>('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [predictiveModel, setPredictiveModel] = useState<PredictiveModel | null>(null);
  const [anomalies, setAnomalies] = useState<AnomalyAlert[]>([]);
  const [selectedInsightTypes, setSelectedInsightTypes] = useState<string[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    loadPredictiveModel();
    detectAnomalies();
    if (autoRefresh) {
      const interval = setInterval(refreshInsights, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh, expenses]);

  const loadPredictiveModel = async () => {
    try {
      // Mock predictive model data
      const model: PredictiveModel = {
        id: 'expense_predictor_v2',
        name: 'Expense Prediction Model',
        accuracy: 0.87,
        lastTrained: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        predictions: {
          nextMonthSpending: calculatePredictedSpending(),
          categoryPredictions: generateCategoryPredictions(),
          savingsOpportunities: generateSavingsOpportunities()
        }
      };
      setPredictiveModel(model);
    } catch (error) {
      console.error('Failed to load predictive model:', error);
    }
  };

  const calculatePredictedSpending = (): number => {
    if (expenses.length === 0) return 0;
    
    const lastMonthExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      return expenseDate >= lastMonth;
    });

    const avgSpending = lastMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
    return avgSpending * 1.05; // 5% increase prediction
  };

  const generateCategoryPredictions = () => {
    const categories: ExpenseCategory[] = ['Food', 'Transportation', 'Entertainment', 'Shopping', 'Bills', 'Other'];
    return categories.map(category => {
      const categoryExpenses = expenses.filter(e => e.category === category);
      const avgAmount = categoryExpenses.length > 0 
        ? categoryExpenses.reduce((sum, e) => sum + e.amount, 0) / categoryExpenses.length 
        : 0;
      
      return {
        category,
        amount: avgAmount * (1 + Math.random() * 0.2 - 0.1), // ±10% variation
        confidence: 0.7 + Math.random() * 0.25 // 70-95% confidence
      };
    });
  };

  const generateSavingsOpportunities = () => {
    return [
      {
        description: 'Reduce dining out frequency by 20%',
        potentialSavings: 150
      },
      {
        description: 'Switch to a cheaper transportation method',
        potentialSavings: 80
      },
      {
        description: 'Cancel unused subscriptions',
        potentialSavings: 45
      }
    ];
  };

  const detectAnomalies = () => {
    if (expenses.length === 0) return;

    const detectedAnomalies: AnomalyAlert[] = [];

    // Detect unusually high amounts
    expenses.forEach(expense => {
      const categoryAvg = expenses
        .filter(e => e.category === expense.category)
        .reduce((sum, e) => sum + e.amount, 0) / expenses.filter(e => e.category === expense.category).length;

      if (expense.amount > categoryAvg * 2.5) {
        detectedAnomalies.push({
          id: `anomaly_${expense.id}`,
          type: 'amount',
          severity: expense.amount > categoryAvg * 4 ? 'high' : 'medium',
          description: `${expense.category} expense of $${expense.amount} is ${Math.round(expense.amount / categoryAvg)}x higher than average`,
          expense,
          recommendation: 'Review this transaction for accuracy and consider if it represents a one-time event or pattern change',
          confidence: 0.92
        });
      }
    });

    // Detect frequency anomalies
    const dailyCounts = expenses.reduce((acc, expense) => {
      const date = expense.date.split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const avgDailyTransactions = Object.values(dailyCounts).reduce((sum, count) => sum + count, 0) / Object.keys(dailyCounts).length;
    
    Object.entries(dailyCounts).forEach(([date, count]) => {
      if (count > avgDailyTransactions * 3) {
        detectedAnomalies.push({
          id: `frequency_${date}`,
          type: 'frequency',
          severity: 'medium',
          description: `${count} transactions on ${date} is unusually high (avg: ${Math.round(avgDailyTransactions)})`,
          recommendation: 'Check if multiple transactions were processed incorrectly or if this represents unusual spending behavior',
          confidence: 0.78
        });
      }
    });

    setAnomalies(detectedAnomalies);
  };

  const refreshInsights = async () => {
    setIsLoading(true);
    try {
      const newInsights = await exportSystemV4.getAI().generateInsights(expenses);
      setInsights(newInsights);
      await loadPredictiveModel();
      detectAnomalies();
      toast.success('AI insights refreshed');
    } catch (error) {
      toast.error('Failed to refresh insights');
      console.error('Refresh error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyAction = async (insight: AIInsight, action: AIAction) => {
    try {
      toast.loading(`Applying ${action.label}...`);
      
      // Simulate action application
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success(`${action.label} applied successfully`);
    } catch (error) {
      toast.error('Failed to apply action');
      console.error('Action error:', error);
    }
  };

  const exportInsights = () => {
    const exportData = {
      insights,
      predictiveModel,
      anomalies,
      generatedAt: new Date().toISOString(),
      totalExpenses: expenses.length,
      analysisMetadata: {
        insightCount: insights.length,
        anomalyCount: anomalies.length,
        modelAccuracy: predictiveModel?.accuracy || 0
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-insights-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('AI insights exported');
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'spending_pattern':
        return <TrendingUp className="w-5 h-5 text-blue-500" />;
      case 'budget_optimization':
        return <Target className="w-5 h-5 text-green-500" />;
      case 'category_suggestion':
        return <PieChart className="w-5 h-5 text-purple-500" />;
      case 'anomaly_alert':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <Lightbulb className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'text-red-600 bg-red-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* AI Model Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-lg text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Model Accuracy</p>
              <p className="text-2xl font-bold">{((predictiveModel?.accuracy || 0) * 100).toFixed(1)}%</p>
            </div>
            <Brain className="h-8 w-8 text-blue-200" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-lg border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Insights</p>
              <p className="text-2xl font-bold text-gray-900">{insights.length}</p>
            </div>
            <Lightbulb className="h-8 w-8 text-yellow-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-lg border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Anomalies Detected</p>
              <p className="text-2xl font-bold text-gray-900">{anomalies.length}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
        </motion.div>
      </div>

      {/* Latest Insights */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Latest AI Insights</h3>
          <div className="flex items-center space-x-2">
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded"
              />
              <span>Auto-refresh</span>
            </label>
            <button
              onClick={refreshInsights}
              disabled={isLoading}
              className="flex items-center space-x-2 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {insights.slice(0, 5).map((insight) => (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  {getInsightIcon(insight.type)}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {(insight.confidence * 100).toFixed(0)}% confidence
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{insight.description}</p>
                    
                    {insight.actionable && insight.actions.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700">Recommended Actions:</p>
                        <div className="flex flex-wrap gap-2">
                          {insight.actions.map((action) => (
                            <button
                              key={action.id}
                              onClick={() => handleApplyAction(insight, action)}
                              className="text-sm bg-green-100 text-green-800 hover:bg-green-200 px-3 py-1 rounded-md transition-colors"
                            >
                              {action.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI-Powered Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center space-x-3 p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <Target className="w-6 h-6 text-green-500" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Auto-Categorize</p>
              <p className="text-sm text-gray-600">Let AI categorize expenses</p>
            </div>
          </button>
          
          <button className="flex items-center space-x-3 p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <DollarSign className="w-6 h-6 text-blue-500" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Budget Optimizer</p>
              <p className="text-sm text-gray-600">AI budget recommendations</p>
            </div>
          </button>
          
          <button className="flex items-center space-x-3 p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <BarChart3 className="w-6 h-6 text-purple-500" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Trend Analysis</p>
              <p className="text-sm text-gray-600">Deep spending insights</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  const renderPredictionsTab = () => (
    <div className="space-y-6">
      {predictiveModel && (
        <>
          {/* Next Month Prediction */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Next Month Spending Prediction</h3>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">${predictiveModel.predictions.nextMonthSpending.toFixed(2)}</p>
              <p className="text-gray-600 mt-2">Predicted total spending for next month</p>
              <div className="mt-4 text-sm text-gray-500">
                Model accuracy: {(predictiveModel.accuracy * 100).toFixed(1)}% • 
                Last trained: {new Date(predictiveModel.lastTrained).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Category Predictions */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Predictions</h3>
            <div className="space-y-3">
              {predictiveModel.predictions.categoryPredictions.map((prediction) => (
                <div key={prediction.category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="font-medium">{prediction.category}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${prediction.amount.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">{(prediction.confidence * 100).toFixed(0)}% confidence</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Savings Opportunities */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">AI-Identified Savings Opportunities</h3>
            <div className="space-y-3">
              {predictiveModel.predictions.savingsOpportunities.map((opportunity, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                  <p className="text-gray-900">{opportunity.description}</p>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">${opportunity.potentialSavings}/month</p>
                    <p className="text-xs text-green-700">Potential savings</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderAnomaliesTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Detected Anomalies</h3>
        <span className="text-sm text-gray-500">{anomalies.length} anomalies found</span>
      </div>

      {anomalies.length > 0 ? (
        <div className="space-y-4">
          {anomalies.map((anomaly) => (
            <motion.div
              key={anomaly.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-lg border border-gray-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(anomaly.severity)}`}>
                      {anomaly.severity.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500">
                      {(anomaly.confidence * 100).toFixed(0)}% confidence
                    </span>
                  </div>
                  
                  <h4 className="font-semibold text-gray-900 mb-2">{anomaly.description}</h4>
                  <p className="text-gray-600 mb-3">{anomaly.recommendation}</p>
                  
                  {anomaly.expense && (
                    <div className="text-sm text-gray-500 bg-gray-50 p-2 rounded">
                      <strong>Related expense:</strong> {anomaly.expense.description} - ${anomaly.expense.amount} on {new Date(anomaly.expense.date).toLocaleDateString()}
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <button className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors">
                    <Check className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Anomalies Detected</h3>
          <p className="text-gray-600">Your spending patterns look normal. We'll keep monitoring for any unusual activity.</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">AI Insights</h2>
          <p className="text-gray-600">Intelligent analysis of your spending patterns</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={exportInsights}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export Insights</span>
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'predictions', label: 'Predictions', icon: TrendingUp },
          { id: 'anomalies', label: 'Anomalies', icon: AlertTriangle },
          { id: 'recommendations', label: 'Recommendations', icon: Lightbulb },
          { id: 'automation', label: 'Automation', icon: Settings }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'predictions' && renderPredictionsTab()}
          {activeTab === 'anomalies' && renderAnomaliesTab()}
          {activeTab === 'recommendations' && (
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">AI Recommendations</h3>
              <p className="text-gray-600">Advanced recommendation engine coming soon...</p>
            </div>
          )}
          {activeTab === 'automation' && (
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">AI Automation</h3>
              <p className="text-gray-600">Automated AI workflows coming soon...</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};