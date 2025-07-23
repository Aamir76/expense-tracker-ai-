'use client';

import { useState, useEffect } from 'react';
import { Expense, EXPENSE_CATEGORIES } from '@/types/expense';
import { formatCurrency } from '@/lib/utils';
import { BaseExportUtils, ExportOptions } from '@/lib/export-system';
import { 
  X, Filter, Eye, Download, Calendar, Tag, FileText, 
  Database, FileSpreadsheet, Loader2 
} from 'lucide-react';

interface HybridExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenses: Expense[];
  onExport: (options: ExportOptions) => Promise<void>;
}

export default function HybridExportModal({ isOpen, onClose, expenses, onExport }: HybridExportModalProps) {
  const [activeTab, setActiveTab] = useState<'filters' | 'preview' | 'export'>('filters');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [format, setFormat] = useState<'csv' | 'json' | 'pdf'>('csv');
  const [filename, setFilename] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  // Filter expenses based on current filters
  const filteredExpenses = BaseExportUtils.filterExpenses(expenses, {
    dateRange: { start: startDate, end: endDate },
    categories: selectedCategories
  });

  // Reset filters when modal opens
  useEffect(() => {
    if (isOpen) {
      setStartDate('');
      setEndDate('');
      setSelectedCategories([]);
      setFormat('csv');
      setFilename('');
      setActiveTab('filters');
    }
  }, [isOpen]);

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleSelectAllCategories = () => {
    setSelectedCategories(EXPENSE_CATEGORIES);
  };

  const handleDeselectAllCategories = () => {
    setSelectedCategories([]);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const exportOptions: ExportOptions = {
        filename: filename || BaseExportUtils.generateFilename('expenses_filtered', format),
        dateRange: { start: startDate, end: endDate },
        categories: selectedCategories,
        format
      };
      
      await onExport(exportOptions);
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const formatCategoryColor = (category: string) => {
    const colors = {
      Food: 'bg-orange-100 text-orange-800',
      Transportation: 'bg-blue-100 text-blue-800',
      Entertainment: 'bg-purple-100 text-purple-800',
      Shopping: 'bg-pink-100 text-pink-800',
      Bills: 'bg-red-100 text-red-800',
      Other: 'bg-gray-100 text-gray-800'
    };
    return colors[category as keyof typeof colors] || colors.Other;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Advanced Export</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200">
          {[
            { id: 'filters', label: 'Filters', icon: Filter },
            { id: 'preview', label: 'Preview', icon: Eye },
            { id: 'export', label: 'Export', icon: Download }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center px-6 py-3 font-medium text-sm transition-colors ${
                activeTab === id
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Filters Tab */}
          {activeTab === 'filters' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Date Range</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Categories</h3>
                  <div className="space-x-2">
                    <button
                      onClick={handleSelectAllCategories}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Select All
                    </button>
                    <button
                      onClick={handleDeselectAllCategories}
                      className="text-sm text-gray-600 hover:text-gray-800"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {EXPENSE_CATEGORIES.map(category => (
                    <label key={category} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category)}
                        onChange={() => handleCategoryToggle(category)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>{filteredExpenses.length}</strong> of <strong>{expenses.length}</strong> expenses match your filters
                </p>
              </div>
            </div>
          )}

          {/* Preview Tab */}
          {activeTab === 'preview' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Data Preview</h3>
                <p className="text-sm text-gray-600">
                  Showing {Math.min(10, filteredExpenses.length)} of {filteredExpenses.length} records
                </p>
              </div>

              {filteredExpenses.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredExpenses.slice(0, 10).map((expense) => (
                        <tr key={expense.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(expense.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">{expense.description}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${formatCategoryColor(expense.category)}`}>
                              {expense.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatCurrency(expense.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>No expenses match your current filters</p>
                </div>
              )}
            </div>
          )}

          {/* Export Tab */}
          {activeTab === 'export' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Export Configuration</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'csv', label: 'CSV', icon: FileSpreadsheet, desc: 'Spreadsheet format' },
                        { value: 'json', label: 'JSON', icon: Database, desc: 'Structured data' },
                        { value: 'pdf', label: 'PDF', icon: FileText, desc: 'Formatted report' }
                      ].map(({ value, label, icon: Icon, desc }) => (
                        <button
                          key={value}
                          onClick={() => setFormat(value as any)}
                          className={`p-4 border rounded-lg text-center transition-colors ${
                            format === value
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Icon className="w-6 h-6 mx-auto mb-2" />
                          <div className="font-medium">{label}</div>
                          <div className="text-xs text-gray-500">{desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Filename (optional)</label>
                    <input
                      type="text"
                      value={filename}
                      onChange={(e) => setFilename(e.target.value)}
                      placeholder={BaseExportUtils.generateFilename('expenses_filtered', format)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Export Summary</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• {filteredExpenses.length} expenses will be exported</li>
                  <li>• Format: {format.toUpperCase()}</li>
                  {startDate && <li>• Date range: {startDate} to {endDate || 'present'}</li>}
                  {selectedCategories.length > 0 && (
                    <li>• Categories: {selectedCategories.join(', ')}</li>
                  )}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
          >
            Cancel
          </button>
          
          <div className="flex space-x-3">
            {activeTab !== 'export' && (
              <button
                onClick={() => {
                  const tabs = ['filters', 'preview', 'export'];
                  const currentIndex = tabs.indexOf(activeTab);
                  if (currentIndex < tabs.length - 1) {
                    setActiveTab(tabs[currentIndex + 1] as any);
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Next
              </button>
            )}
            
            {activeTab === 'export' && (
              <button
                onClick={handleExport}
                disabled={isExporting || filteredExpenses.length === 0}
                className="flex items-center px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Export {format.toUpperCase()}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}