'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, 
  BarChart3, 
  Users, 
  Brain, 
  Settings, 
  Play, 
  Pause, 
  Calendar,
  Filter,
  FileText,
  Share2,
  Zap,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  MoreVertical
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Expense } from '../types/expense';
import { ExportJob, ExportTemplateV4, AIInsight, CollaborativeWorkspace } from '../types/export-v4';
import { exportSystemV4 } from '../lib/export-system-v4';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { CollaborationHub } from './CollaborationHub';
import { AIInsightsPanel } from './AIInsightsPanel';

interface ExportSystemV4Props {
  expenses: Expense[];
  onExportComplete?: (job: ExportJob) => void;
  onShowAnalytics?: (show: boolean) => void;
  onShowCollaboration?: (show: boolean) => void;
}

export const ExportSystemV4: React.FC<ExportSystemV4Props> = ({
  expenses,
  onExportComplete,
  onShowAnalytics,
  onShowCollaboration
}) => {
  const [currentView, setCurrentView] = useState<'overview' | 'export' | 'analytics' | 'collaboration' | 'ai'>('overview');
  const [exportJobs, setExportJobs] = useState<ExportJob[]>([]);
  const [aiInsights, setAIInsights] = useState<AIInsight[]>([]);
  const [workspace, setWorkspace] = useState<CollaborativeWorkspace | null>(null);
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const [systemStats, setSystemStats] = useState({
    totalExports: 0,
    successRate: 100,
    avgProcessingTime: 2.3,
    activeJobs: 0
  });

  useEffect(() => {
    initializeSystem();
    setupRealtimeConnection();
    loadAIInsights();
    createDefaultWorkspace();
  }, []);

  useEffect(() => {
    const jobs = exportSystemV4.getJobs();
    setExportJobs(jobs);
    updateSystemStats(jobs);
  }, []);

  const initializeSystem = () => {
    console.log('Initializing Export System V4...');
    const services = exportSystemV4.getServices();
    console.log(`Loaded ${services.length} export services`);
  };

  const setupRealtimeConnection = () => {
    const connectionId = exportSystemV4.getRealtime().connect('user_demo');
    setRealtimeConnected(true);

    // Listen for export events
    exportSystemV4.getRealtime().on('export_completed', (event: any) => {
      toast.success('Export completed successfully!');
      refreshJobs();
    });

    exportSystemV4.getRealtime().on('export_failed', (event: any) => {
      toast.error('Export failed. Please try again.');
      refreshJobs();
    });

    exportSystemV4.getRealtime().on('export_progress', (event: any) => {
      refreshJobs();
    });
  };

  const loadAIInsights = async () => {
    try {
      const insights = await exportSystemV4.getAI().generateInsights(expenses);
      setAIInsights(insights);
    } catch (error) {
      console.error('Failed to load AI insights:', error);
    }
  };

  const createDefaultWorkspace = () => {
    const ws = exportSystemV4.getCollaboration().createWorkspace('My Expense Workspace', 'user_demo');
    setWorkspace(ws);
  };

  const refreshJobs = () => {
    const jobs = exportSystemV4.getJobs();
    setExportJobs(jobs);
    updateSystemStats(jobs);
  };

  const updateSystemStats = (jobs: ExportJob[]) => {
    const completed = jobs.filter(j => j.status === 'completed').length;
    const failed = jobs.filter(j => j.status === 'failed').length;
    const active = jobs.filter(j => j.status === 'processing' || j.status === 'pending').length;
    
    setSystemStats({
      totalExports: jobs.length,
      successRate: jobs.length > 0 ? Math.round((completed / jobs.length) * 100) : 100,
      avgProcessingTime: 2.3,
      activeJobs: active
    });
  };

  const handleQuickExport = async (format: 'csv' | 'pdf' | 'json') => {
    if (expenses.length === 0) {
      toast.error('No expenses to export');
      return;
    }

    const template: ExportTemplateV4 = {
      id: `quick_${format}`,
      name: `Quick ${format.toUpperCase()} Export`,
      description: `Quick export in ${format.toUpperCase()} format`,
      category: 'personal',
      version: '1.0.0',
      schema: {
        fields: [
          { key: 'date', name: 'Date', type: 'date', required: true },
          { key: 'description', name: 'Description', type: 'string', required: true },
          { key: 'category', name: 'Category', type: 'category', required: true },
          { key: 'amount', name: 'Amount', type: 'number', required: true }
        ],
        grouping: [],
        calculations: [],
        filters: []
      },
      styling: {
        theme: 'light',
        colors: {
          primary: '#3b82f6',
          secondary: '#64748b',
          accent: '#10b981',
          background: '#ffffff',
          text: '#1f2937',
          border: '#e5e7eb'
        },
        fonts: {
          family: 'Inter',
          sizes: { small: '12px', medium: '14px', large: '16px' },
          weights: { normal: 400, bold: 600 }
        },
        layout: {
          orientation: 'portrait',
          margins: { top: 20, right: 20, bottom: 20, left: 20 },
          spacing: { section: 16, item: 8, paragraph: 12 },
          branding: { footer: 'Generated by Expense Tracker V4' }
        }
      },
      automation: {
        scheduling: { enabled: false, frequency: 'monthly', time: '09:00', timezone: 'UTC' },
        triggers: [],
        actions: [],
        workflows: []
      },
      permissions: {
        public: false,
        shareable: true,
        editable: false,
        cloneable: true,
        marketplace: false
      },
      metadata: {
        author: 'System',
        version: '1.0.0',
        tags: ['quick', format],
        downloads: 0,
        rating: 0,
        reviews: 0,
        featured: false,
        lastUpdated: new Date().toISOString()
      }
    };

    try {
      toast.loading(`Exporting ${expenses.length} expenses as ${format.toUpperCase()}...`);
      
      const job = await exportSystemV4.createExportJob(template, expenses, {
        format,
        destination: 'download',
        userId: 'user_demo'
      });

      onExportComplete?.(job);
    } catch (error) {
      toast.error('Export failed. Please try again.');
      console.error('Export error:', error);
    }
  };

  const getJobStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-lg border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Exports</p>
              <p className="text-2xl font-bold text-gray-900">{systemStats.totalExports}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-500" />
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
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-green-600">{systemStats.successRate}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
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
              <p className="text-sm font-medium text-gray-600">Avg Processing</p>
              <p className="text-2xl font-bold text-blue-600">{systemStats.avgProcessingTime}s</p>
            </div>
            <Zap className="h-8 w-8 text-blue-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-lg border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Jobs</p>
              <p className="text-2xl font-bold text-purple-600">{systemStats.activeJobs}</p>
            </div>
            <Settings className="h-8 w-8 text-purple-500" />
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Export</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleQuickExport('csv')}
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <div className="text-center">
              <Download className="w-8 h-8 text-gray-500 mx-auto mb-2" />
              <p className="font-medium text-gray-900">CSV Export</p>
              <p className="text-sm text-gray-500">Spreadsheet format</p>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleQuickExport('pdf')}
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-red-500 hover:bg-red-50 transition-colors"
          >
            <div className="text-center">
              <FileText className="w-8 h-8 text-gray-500 mx-auto mb-2" />
              <p className="font-medium text-gray-900">PDF Report</p>
              <p className="text-sm text-gray-500">Professional format</p>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleQuickExport('json')}
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
          >
            <div className="text-center">
              <Settings className="w-8 h-8 text-gray-500 mx-auto mb-2" />
              <p className="font-medium text-gray-900">JSON Data</p>
              <p className="text-sm text-gray-500">Developer format</p>
            </div>
          </motion.button>
        </div>
      </div>

      {/* Recent Jobs */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Export Jobs</h3>
        <div className="space-y-3">
          {exportJobs.slice(0, 5).map((job) => (
            <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                {getJobStatusIcon(job.status)}
                <div>
                  <p className="font-medium text-gray-900">{job.name}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(job.createdAt).toLocaleString()} • {job.metadata.recordCount} records
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {job.status === 'processing' && (
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${job.progress.percentage}%` }}
                    />
                  </div>
                )}
                <span className="text-xs text-gray-500 capitalize">{job.status}</span>
              </div>
            </div>
          ))}
          {exportJobs.length === 0 && (
            <p className="text-gray-500 text-center py-8">No export jobs yet. Try a quick export above!</p>
          )}
        </div>
      </div>

      {/* AI Insights Preview */}
      {aiInsights.length > 0 && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">AI Insights</h3>
            <button
              onClick={() => setCurrentView('ai')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View All →
            </button>
          </div>
          <div className="space-y-3">
            {aiInsights.slice(0, 2).map((insight) => (
              <div key={insight.id} className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{insight.title}</p>
                    <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                  </div>
                  <Brain className="w-5 h-5 text-blue-500 flex-shrink-0 ml-2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Export System V4</h1>
          <p className="text-gray-600">Enterprise-grade data export and analytics platform</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
            realtimeConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            <div className={`w-2 h-2 rounded-full ${realtimeConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span>{realtimeConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'export', label: 'Export', icon: Download },
          { id: 'analytics', label: 'Analytics', icon: TrendingUp },
          { id: 'collaboration', label: 'Collaboration', icon: Users },
          { id: 'ai', label: 'AI Insights', icon: Brain }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setCurrentView(tab.id as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors ${
              currentView === tab.id
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
          key={currentView}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {currentView === 'overview' && renderOverview()}
          {currentView === 'export' && (
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h2 className="text-xl font-semibold mb-4">Advanced Export Options</h2>
              <p className="text-gray-600">Advanced export features coming soon...</p>
            </div>
          )}
          {currentView === 'analytics' && (
            <AnalyticsDashboard expenses={expenses} />
          )}
          {currentView === 'collaboration' && workspace && (
            <CollaborationHub workspace={workspace} />
          )}
          {currentView === 'ai' && (
            <AIInsightsPanel insights={aiInsights} expenses={expenses} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};