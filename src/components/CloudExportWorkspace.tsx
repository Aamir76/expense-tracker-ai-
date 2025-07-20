'use client';

import { useState, useEffect } from 'react';
import { Expense, ExpenseCategory, EXPENSE_CATEGORIES } from '@/types/expense';
import { formatCurrency } from '@/lib/utils';
import { 
  Cloud, Mail, FileSpreadsheet, Calendar, History, Share2, 
  Zap, CheckCircle, Clock, ExternalLink, QrCode, Copy,
  Database, HardDrive, FileText, Download, Settings, Star,
  Users, Shield, Sparkles, Rocket, Globe, Send
} from 'lucide-react';
import QRCode from 'qrcode';
import toast, { Toaster } from 'react-hot-toast';

interface ExportTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  category: 'financial' | 'business' | 'personal';
  features: string[];
  popular?: boolean;
}

interface CloudIntegration {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  connected: boolean;
  lastSync?: string;
  status: 'connected' | 'disconnected' | 'syncing' | 'error';
}

interface ExportHistory {
  id: string;
  templateName: string;
  createdAt: string;
  format: string;
  records: number;
  status: 'completed' | 'processing' | 'failed';
  sharedWith?: string[];
  destination: string;
}

interface CloudExportWorkspaceProps {
  isOpen: boolean;
  onClose: () => void;
  expenses: Expense[];
}

export default function CloudExportWorkspace({ isOpen, onClose, expenses }: CloudExportWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<'templates' | 'integrations' | 'history' | 'automation'>('templates');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);

  const templates: ExportTemplate[] = [
    {
      id: 'tax-report',
      name: 'Tax Report',
      description: 'IRS-ready expense report with category breakdowns and deduction summaries',
      icon: FileText,
      category: 'financial',
      features: ['Tax-compliant formatting', 'Category totals', 'Quarterly summaries', 'Receipt tracking'],
      popular: true
    },
    {
      id: 'monthly-summary',
      name: 'Monthly Summary',
      description: 'Executive dashboard view with spending trends and budget analysis',
      icon: Calendar,
      category: 'business',
      features: ['Trend analysis', 'Budget comparison', 'Category insights', 'Visual charts'],
      popular: true
    },
    {
      id: 'category-analysis',
      name: 'Category Deep Dive',
      description: 'Detailed breakdown by spending categories with recommendations',
      icon: FileSpreadsheet,
      category: 'personal',
      features: ['Category rankings', 'Spending patterns', 'Recommendations', 'Goal tracking']
    },
    {
      id: 'team-report',
      name: 'Team Collaboration',
      description: 'Shared expense report for team projects and reimbursements',
      icon: Users,
      category: 'business',
      features: ['Multi-user access', 'Approval workflow', 'Comments', 'Real-time sync']
    },
    {
      id: 'investment-tracker',
      name: 'Investment Analysis',
      description: 'Track business investments and ROI with financial modeling',
      icon: Sparkles,
      category: 'financial',
      features: ['ROI calculations', 'Investment tracking', 'Performance metrics', 'Forecasting']
    },
    {
      id: 'compliance-audit',
      name: 'Compliance Audit',
      description: 'Audit-ready reports with compliance checks and documentation',
      icon: Shield,
      category: 'business',
      features: ['Compliance checks', 'Audit trail', 'Documentation', 'Risk assessment']
    }
  ];

  const integrations: CloudIntegration[] = [
    { id: 'google-sheets', name: 'Google Sheets', icon: Database, connected: true, lastSync: '2 minutes ago', status: 'connected' },
    { id: 'dropbox', name: 'Dropbox', icon: HardDrive, connected: true, lastSync: '1 hour ago', status: 'connected' },
    { id: 'gmail', name: 'Gmail', icon: Mail, connected: false, status: 'disconnected' },
    { id: 'onedrive', name: 'OneDrive', icon: Cloud, connected: true, lastSync: 'Syncing...', status: 'syncing' },
  ];

  const exportHistory: ExportHistory[] = [
    {
      id: '1',
      templateName: 'Monthly Summary',
      createdAt: '2 hours ago',
      format: 'Google Sheets',
      records: 145,
      status: 'completed',
      sharedWith: ['team@company.com', 'manager@company.com'],
      destination: 'Google Drive'
    },
    {
      id: '2',
      templateName: 'Tax Report',
      createdAt: '1 day ago',
      format: 'PDF + Excel',
      records: 89,
      status: 'completed',
      destination: 'Email'
    },
    {
      id: '3',
      templateName: 'Category Analysis',
      createdAt: '3 days ago',
      format: 'Interactive Dashboard',
      records: 203,
      status: 'processing',
      destination: 'Shared Link'
    }
  ];

  const generateShareLink = async () => {
    setIsProcessing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    const link = `https://expense-share.app/report/${Math.random().toString(36).substr(2, 9)}`;
    setShareLink(link);
    
    // Generate QR Code
    try {
      const qrUrl = await QRCode.toDataURL(link);
      setQrCodeUrl(qrUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
    
    setIsProcessing(false);
    setShowShareModal(true);
    toast.success('Shareable link generated!');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const handleExportWithTemplate = async (templateId: string) => {
    setIsProcessing(true);
    const template = templates.find(t => t.id === templateId);
    
    // Simulate cloud processing
    toast.loading('Processing export...', { duration: 2000 });
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast.success(`${template?.name} exported successfully!`);
    setIsProcessing(false);
  };

  if (!isOpen) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'syncing': return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      case 'error': return <div className="w-4 h-4 bg-red-500 rounded-full" />;
      default: return <div className="w-4 h-4 bg-gray-300 rounded-full" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'processing': return 'text-blue-600 bg-blue-50';
      case 'failed': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose}></div>

          <div className="relative w-full max-w-7xl bg-white rounded-xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                    <Cloud className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-white">
                    <h2 className="text-xl font-bold">Cloud Export Hub</h2>
                    <p className="text-blue-100 text-sm">Share, collaborate, and automate your expense data</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Navigation */}
            <div className="border-b border-gray-200 bg-gray-50">
              <div className="flex">
                {[
                  { id: 'templates', label: 'Export Templates', icon: Rocket },
                  { id: 'integrations', label: 'Integrations', icon: Zap },
                  { id: 'history', label: 'Export History', icon: History },
                  { id: 'automation', label: 'Automation', icon: Settings }
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600 bg-white'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Content */}
            <div className="p-6 max-h-96 overflow-y-auto">
              {activeTab === 'templates' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Choose Your Export Template</h3>
                      <p className="text-gray-600">Professional templates designed for different use cases</p>
                    </div>
                    <button
                      onClick={generateShareLink}
                      disabled={isProcessing}
                      className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 disabled:opacity-50"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Quick Share</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {templates.map((template) => {
                      const Icon = template.icon;
                      return (
                        <div
                          key={template.id}
                          className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                            selectedTemplate === template.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedTemplate(template.id)}
                        >
                          {template.popular && (
                            <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
                              <Star className="w-3 h-3 mr-1" />
                              Popular
                            </div>
                          )}
                          
                          <div className="flex items-start space-x-3 mb-3">
                            <div className={`p-2 rounded-lg ${template.category === 'financial' ? 'bg-green-100' : template.category === 'business' ? 'bg-blue-100' : 'bg-purple-100'}`}>
                              <Icon className={`w-5 h-5 ${template.category === 'financial' ? 'text-green-600' : template.category === 'business' ? 'text-blue-600' : 'text-purple-600'}`} />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{template.name}</h4>
                              <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                            </div>
                          </div>

                          <div className="space-y-1 mb-4">
                            {template.features.slice(0, 3).map((feature, index) => (
                              <div key={index} className="flex items-center space-x-2 text-xs text-gray-500">
                                <CheckCircle className="w-3 h-3 text-green-500" />
                                <span>{feature}</span>
                              </div>
                            ))}
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExportWithTemplate(template.id);
                            }}
                            disabled={isProcessing}
                            className="w-full py-2 px-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm rounded-md hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 transition-all"
                          >
                            Export Now
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'integrations' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Cloud Integrations</h3>
                    <p className="text-gray-600">Connect your favorite services for seamless data sync</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {integrations.map((integration) => {
                      const Icon = integration.icon;
                      return (
                        <div
                          key={integration.id}
                          className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-gray-100 rounded-lg">
                                <Icon className="w-5 h-5 text-gray-600" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900">{integration.name}</h4>
                                {integration.connected && (
                                  <p className="text-xs text-gray-500">Last sync: {integration.lastSync}</p>
                                )}
                              </div>
                            </div>
                            {getStatusIcon(integration.status)}
                          </div>

                          {integration.connected ? (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-green-600 font-medium">Connected</span>
                              <div className="flex space-x-2">
                                <button className="text-xs text-blue-600 hover:text-blue-800">Configure</button>
                                <button className="text-xs text-red-600 hover:text-red-800">Disconnect</button>
                              </div>
                            </div>
                          ) : (
                            <button className="w-full py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors">
                              Connect
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <Sparkles className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-blue-900">Pro Tip</h4>
                        <p className="text-sm text-blue-700 mt-1">
                          Connect multiple services to create automated workflows. For example, auto-export to Google Sheets every month and email to your accountant.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'history' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Export History</h3>
                      <p className="text-gray-600">Track all your exports and shares</p>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>Last 30 days</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {exportHistory.map((export_) => (
                      <div key={export_.id} className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="font-medium text-gray-900">{export_.templateName}</h4>
                              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(export_.status)}`}>
                                {export_.status}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                              <div>
                                <span className="text-gray-500">Created:</span> {export_.createdAt}
                              </div>
                              <div>
                                <span className="text-gray-500">Format:</span> {export_.format}
                              </div>
                              <div>
                                <span className="text-gray-500">Records:</span> {export_.records}
                              </div>
                              <div>
                                <span className="text-gray-500">Destination:</span> {export_.destination}
                              </div>
                            </div>
                            {export_.sharedWith && (
                              <div className="mt-2 text-sm text-gray-600">
                                <span className="text-gray-500">Shared with:</span> {export_.sharedWith.join(', ')}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <button className="p-2 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50">
                              <ExternalLink className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-green-600 rounded-full hover:bg-green-50">
                              <Download className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-purple-600 rounded-full hover:bg-purple-50">
                              <Share2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'automation' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Automation & Scheduling</h3>
                    <p className="text-gray-600">Set up recurring exports and automated workflows</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-3">Scheduled Exports</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div>
                            <p className="font-medium text-green-900">Monthly Tax Report</p>
                            <p className="text-sm text-green-700">Every 1st of the month to Gmail</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-xs text-green-600">Active</span>
                          </div>
                        </div>
                        
                        <button className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors">
                          + Add New Schedule
                        </button>
                      </div>
                    </div>

                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-3">Smart Workflows</h4>
                      <div className="space-y-3">
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="font-medium text-blue-900">Expense Threshold Alert</p>
                          <p className="text-sm text-blue-700">Auto-export when monthly spending exceeds $5,000</p>
                        </div>
                        
                        <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                          <p className="font-medium text-purple-900">Team Collaboration</p>
                          <p className="text-sm text-purple-700">Share weekly summaries with project team</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <Rocket className="w-5 h-5 text-orange-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-orange-900">Coming Soon: AI-Powered Automation</h4>
                        <p className="text-sm text-orange-700 mt-1">
                          Our AI will automatically detect spending patterns and suggest optimal export schedules and recipients.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  {expenses.length} expenses • Cloud-powered export system
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600">All integrations online</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowShareModal(false)}></div>
          
          <div className="relative bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="text-center mb-4">
              <div className="p-3 bg-green-100 rounded-full w-fit mx-auto mb-3">
                <Share2 className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Share Your Data</h3>
              <p className="text-gray-600">Share this report with your team or clients</p>
            </div>

            {qrCodeUrl && (
              <div className="text-center mb-4">
                <img src={qrCodeUrl} alt="QR Code" className="mx-auto w-32 h-32" />
                <p className="text-xs text-gray-500 mt-2">Scan with your phone</p>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shareable Link</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={shareLink}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
                  />
                  <button
                    onClick={() => copyToClipboard(shareLink)}
                    className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex space-x-2">
                <button className="flex-1 flex items-center justify-center space-x-2 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  <Send className="w-4 h-4" />
                  <span>Email</span>
                </button>
                <button className="flex-1 flex items-center justify-center space-x-2 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                  <Users className="w-4 h-4" />
                  <span>Slack</span>
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowShareModal(false)}
              className="w-full mt-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}