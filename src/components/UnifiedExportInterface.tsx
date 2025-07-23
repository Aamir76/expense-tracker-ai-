'use client';

import { useState } from 'react';
import { Expense } from '@/types/expense';
import { ExportSystemFactory, ExportOptions } from '@/lib/export-system';
import HybridExportModal from './HybridExportModal';
import HybridCloudWorkspace from './HybridCloudWorkspace';
import { Download, Settings, Cloud, ChevronDown } from 'lucide-react';

interface UnifiedExportInterfaceProps {
  expenses: Expense[];
  filteredExpenses?: Expense[];
}

export default function UnifiedExportInterface({ 
  expenses, 
  filteredExpenses = expenses 
}: UnifiedExportInterfaceProps) {
  const [showAdvancedModal, setShowAdvancedModal] = useState(false);
  const [showCloudWorkspace, setShowCloudWorkspace] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const exportSystem = ExportSystemFactory.create();

  // Quick CSV export (Tier 1)
  const handleQuickCSVExport = () => {
    exportSystem.basic.exportToCSV(filteredExpenses);
  };

  // Advanced export with modal (Tier 2)
  const handleAdvancedExport = async (options: ExportOptions) => {
    await exportSystem.advanced.exportWithFilters(expenses, options);
  };

  // Cloud export with templates (Tier 3)
  const handleCloudExportWithTemplate = async (templateId: string) => {
    await exportSystem.cloud.exportWithTemplate(expenses, templateId);
  };

  return (
    <>
      {/* Export Button Group */}
      <div className="relative inline-block">
        {/* Primary Quick Export Button */}
        <div className="flex">
          <button
            onClick={handleQuickCSVExport}
            disabled={filteredExpenses.length === 0}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-l-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </button>
          
          {/* Dropdown Toggle */}
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="px-2 py-2 bg-green-600 text-white rounded-r-md hover:bg-green-700 border-l border-green-700 transition-colors"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {/* Dropdown Menu */}
        {showDropdown && (
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-40">
            <div className="p-2">
              {/* Tier 1: Quick Export */}
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Quick Export
              </div>
              <button
                onClick={() => {
                  handleQuickCSVExport();
                  setShowDropdown(false);
                }}
                disabled={filteredExpenses.length === 0}
                className="w-full flex items-center px-3 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4 mr-3 text-green-600" />
                <div>
                  <div className="font-medium">CSV Export</div>
                  <div className="text-sm text-gray-500">
                    Instant download • {filteredExpenses.length} records
                  </div>
                </div>
              </button>

              <div className="border-t border-gray-100 my-2"></div>

              {/* Tier 2: Advanced Export */}
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Advanced Export
              </div>
              <button
                onClick={() => {
                  setShowAdvancedModal(true);
                  setShowDropdown(false);
                }}
                disabled={expenses.length === 0}
                className="w-full flex items-center px-3 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Settings className="w-4 h-4 mr-3 text-blue-600" />
                <div>
                  <div className="font-medium">Multi-Format Export</div>
                  <div className="text-sm text-gray-500">
                    CSV, JSON, PDF • Filters & preview
                  </div>
                </div>
              </button>

              <div className="border-t border-gray-100 my-2"></div>

              {/* Tier 3: Cloud Export */}
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Cloud Integration
              </div>
              <button
                onClick={() => {
                  setShowCloudWorkspace(true);
                  setShowDropdown(false);
                }}
                disabled={expenses.length === 0}
                className="w-full flex items-center px-3 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Cloud className="w-4 h-4 mr-3 text-purple-600" />
                <div>
                  <div className="font-medium">Cloud Workspace</div>
                  <div className="text-sm text-gray-500">
                    Templates • Sharing • Automation
                  </div>
                </div>
              </button>
            </div>

            {/* Footer */}
            <div className="px-3 py-2 bg-gray-50 rounded-b-lg border-t border-gray-100">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{expenses.length} total expenses</span>
                <span>Progressive export system</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => setShowDropdown(false)}
        ></div>
      )}

      {/* Advanced Export Modal (Tier 2) */}
      <HybridExportModal
        isOpen={showAdvancedModal}
        onClose={() => setShowAdvancedModal(false)}
        expenses={expenses}
        onExport={handleAdvancedExport}
      />

      {/* Cloud Workspace (Tier 3) */}
      <HybridCloudWorkspace
        isOpen={showCloudWorkspace}
        onClose={() => setShowCloudWorkspace(false)}
        expenses={expenses}
        onExportWithTemplate={handleCloudExportWithTemplate}
      />
    </>
  );
}