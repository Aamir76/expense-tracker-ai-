'use client';

import { useState, useEffect } from 'react';
import { Expense } from '@/types/expense';
import { formatCurrency } from '@/lib/utils';
import { 
  X, FileText, Calendar, Users, Sparkles, Shield, Database,
  Cloud, Mail, FileSpreadsheet, History, Share2, Zap, 
  CheckCircle, Clock, ExternalLink, QrCode, Copy, Star,
  Settings, Rocket, Globe, Send, Download
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

interface HybridCloudWorkspaceProps {
  isOpen: boolean;
  onClose: () => void;
  expenses: Expense[];
  onExportWithTemplate: (templateId: string) => Promise<void>;
}

export default function HybridCloudWorkspace({ 
  isOpen, 
  onClose, 
  expenses, 
  onExportWithTemplate 
}: HybridCloudWorkspaceProps) {
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
      description: 'Audit-ready reports with risk assessment and compliance checks',
      icon: Shield,
      category: 'financial',
      features: ['Audit trail', 'Risk assessment', 'Compliance checks', 'Documentation']
    },
    {
      id: 'category-analysis',
      name: 'Category Deep Dive',
      description: 'Detailed breakdown by spending categories with recommendations',
      icon: Database,
      category: 'personal',
      features: ['Category rankings', 'Spending patterns', 'Recommendations', 'Goal tracking']
    }
  ];

  const integrations: CloudIntegration[] = [
    { id: 'google-sheets', name: 'Google Sheets', icon: FileSpreadsheet, connected: true, status: 'connected', lastSync: '2 minutes ago' },
    { id: 'dropbox', name: 'Dropbox', icon: Cloud, connected: true, status: 'connected', lastSync: '1 hour ago' },
    { id: 'gmail', name: 'Gmail', icon: Mail, connected: false, status: 'disconnected' },
    { id: 'onedrive', name: 'OneDrive', icon: Database, connected: true, status: 'syncing' }
  ];

  const exportHistory: ExportHistory[] = [
    {
      id: '1',
      templateName: 'Tax Report',
      createdAt: '2024-01-15T10:30:00Z',
      format: 'PDF',
      records: 156,
      status: 'completed',
      sharedWith: ['john@company.com', 'sarah@company.com'],
      destination: 'Google Sheets, Email'
    },
    {
      id: '2',
      templateName: 'Monthly Summary',
      createdAt: '2024-01-14T16:45:00Z',
      format: 'JSON',
      records: 89,
      status: 'completed',
      destination: 'Dropbox'
    },
    {
      id: '3',
      templateName: 'Team Collaboration',
      createdAt: '2024-01-14T09:15:00Z',
      format: 'CSV',
      records: 234,
      status: 'processing',
      destination: 'OneDrive'
    }
  ];

  useEffect(() => {
    if (isOpen) {
      setSelectedTemplate('');
      setActiveTab('templates');
    }
  }, [isOpen]);

  const handleTemplateSelect = async (templateId: string) => {
    setSelectedTemplate(templateId);
    setIsProcessing(true);
    
    try {
      await onExportWithTemplate(templateId);
      toast.success(`Export started with ${templates.find(t => t.id === templateId)?.name} template`);
    } catch (error) {
      toast.error('Export failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleShare = async (exportId: string) => {
    const mockShareLink = `https://expense-tracker.app/shared/${exportId}`;
    setShareLink(mockShareLink);
    
    try {
      const qrCode = await QRCode.toDataURL(mockShareLink);
      setQrCodeUrl(qrCode);
      setShowShareModal(true);
    } catch (error) {
      toast.error('Failed to generate share link');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Cloud Export Workspace</h2>
                <p className="text-blue-100 mt-1">Professional export templates with cloud integration</p>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 bg-gray-50">
            {[
              { id: 'templates', label: 'Templates', icon: FileText },
              { id: 'integrations', label: 'Integrations', icon: Cloud },
              { id: 'history', label: 'History', icon: History },
              { id: 'automation', label: 'Automation', icon: Zap }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center px-6 py-4 font-medium text-sm transition-colors ${
                  activeTab === id
                    ? 'border-b-2 border-blue-500 text-blue-600 bg-white'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {/* Templates Tab */}
            {activeTab === 'templates' && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Choose Export Template</h3>
                  <p className="text-gray-600">Select a professional template optimized for your use case</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className={`relative p-6 border rounded-lg cursor-pointer transition-all hover:shadow-lg ${
                        selectedTemplate === template.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleTemplateSelect(template.id)}
                    >
                      {template.popular && (
                        <div className="absolute -top-2 -right-2">
                          <div className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
                            <Star className="w-3 h-3 mr-1" />
                            Popular
                          </div>
                        </div>
                      )}

                      <div className="flex items-center mb-4">
                        <div className={`p-3 rounded-full ${
                          template.category === 'financial' ? 'bg-green-100' :
                          template.category === 'business' ? 'bg-blue-100' : 'bg-purple-100'
                        }`}>
                          <template.icon className={`w-6 h-6 ${
                            template.category === 'financial' ? 'text-green-600' :
                            template.category === 'business' ? 'text-blue-600' : 'text-purple-600'
                          }`} />
                        </div>
                        <div className="ml-4">
                          <h4 className="font-semibold text-gray-900">{template.name}</h4>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            template.category === 'financial' ? 'bg-green-100 text-green-800' :
                            template.category === 'business' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                          }`}>
                            {template.category}
                          </span>
                        </div>
                      </div>

                      <p className="text-gray-600 text-sm mb-4">{template.description}</p>

                      <div className="space-y-1">
                        {template.features.map((feature, index) => (
                          <div key={index} className="flex items-center text-sm text-gray-500">
                            <CheckCircle className="w-3 h-3 mr-2 text-green-500" />
                            {feature}
                          </div>
                        ))}
                      </div>

                      {isProcessing && selectedTemplate === template.id && (
                        <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-lg">
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                            <p className="text-sm text-gray-600">Processing...</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Integrations Tab */}
            {activeTab === 'integrations' && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Cloud Integrations</h3>
                  <p className="text-gray-600">Connect your favorite cloud services for seamless export</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {integrations.map((integration) => (
                    <div key={integration.id} className="p-6 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <div className="p-3 bg-gray-100 rounded-full">
                            <integration.icon className="w-6 h-6 text-gray-600" />
                          </div>
                          <div className="ml-4">
                            <h4 className="font-semibold text-gray-900">{integration.name}</h4>
                            {integration.lastSync && (
                              <p className="text-sm text-gray-500">Last sync: {integration.lastSync}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          {integration.status === 'connected' && (
                            <span className="flex items-center text-green-600 text-sm">
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Connected
                            </span>
                          )}
                          {integration.status === 'syncing' && (
                            <span className="flex items-center text-blue-600 text-sm">
                              <Clock className="w-4 h-4 mr-1 animate-spin" />
                              Syncing
                            </span>
                          )}
                          {integration.status === 'disconnected' && (
                            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                              Connect
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Export History</h3>
                  <p className="text-gray-600">View and manage your previous exports</p>
                </div>

                <div className="space-y-4">
                  {exportHistory.map((export_) => (
                    <div key={export_.id} className="p-6 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <h4 className="font-semibold text-gray-900 mr-3">{export_.templateName}</h4>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              export_.status === 'completed' ? 'bg-green-100 text-green-800' :
                              export_.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {export_.status}
                            </span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600 space-x-4">
                            <span>{export_.format} • {export_.records} records</span>
                            <span>{new Date(export_.createdAt).toLocaleDateString()}</span>
                            <span>→ {export_.destination}</span>
                          </div>
                          {export_.sharedWith && (
                            <div className="mt-2 text-sm text-gray-500">
                              Shared with: {export_.sharedWith.join(', ')}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {export_.status === 'completed' && (
                            <>
                              <button
                                onClick={() => handleShare(export_.id)}
                                className="flex items-center px-3 py-1 text-blue-600 hover:text-blue-800 text-sm"
                              >
                                <Share2 className="w-4 h-4 mr-1" />
                                Share
                              </button>
                              <button className="flex items-center px-3 py-1 text-gray-600 hover:text-gray-800 text-sm">
                                <Download className="w-4 h-4 mr-1" />
                                Download
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Automation Tab */}
            {activeTab === 'automation' && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Export Automation</h3>
                  <p className="text-gray-600">Set up automated exports and smart workflows</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 border border-gray-200 rounded-lg">
                    <div className="flex items-center mb-4">
                      <div className="p-3 bg-blue-100 rounded-full">
                        <Calendar className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <h4 className="font-semibold text-gray-900">Scheduled Exports</h4>
                        <p className="text-sm text-gray-600">Automatic monthly/weekly reports</p>
                      </div>
                    </div>
                    <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                      Set up Schedule
                    </button>
                  </div>

                  <div className="p-6 border border-gray-200 rounded-lg">
                    <div className="flex items-center mb-4">
                      <div className="p-3 bg-purple-100 rounded-full">
                        <Zap className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <h4 className="font-semibold text-gray-900">Smart Triggers</h4>
                        <p className="text-sm text-gray-600">Export when conditions are met</p>
                      </div>
                    </div>
                    <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
                      Create Trigger
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {expenses.length} expenses available for export
              </div>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Close Workspace
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Share Export</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="text-center">
                {qrCodeUrl && (
                  <img src={qrCodeUrl} alt="QR Code" className="w-32 h-32 mx-auto mb-4" />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Share Link</label>
                <div className="flex">
                  <input
                    type="text"
                    value={shareLink}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50"
                  />
                  <button
                    onClick={() => copyToClipboard(shareLink)}
                    className="px-3 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex space-x-2">
                <button className="flex-1 flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </button>
                <button className="flex-1 flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
                  <Send className="w-4 h-4 mr-2" />
                  Slack
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Toaster position="top-right" />
    </>
  );
}