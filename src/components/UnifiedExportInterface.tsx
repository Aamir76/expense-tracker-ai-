'use client';

import { Expense } from '@/types/expense';
import { BaseExportUtils } from '@/lib/export-system';

interface UnifiedExportInterfaceProps {
  expenses: Expense[];
  filteredExpenses?: Expense[];
}

export default function UnifiedExportInterface({
  expenses,
  filteredExpenses = expenses
}: UnifiedExportInterfaceProps) {

  const handleCSVExport = () => {
    const csvContent = BaseExportUtils.generateCSV(filteredExpenses);
    const filename = BaseExportUtils.generateFilename('expenses', 'csv');
    BaseExportUtils.downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
  };

  const handleJSONExport = () => {
    const jsonContent = BaseExportUtils.generateJSON(filteredExpenses);
    const filename = BaseExportUtils.generateFilename('expenses', 'json');
    BaseExportUtils.downloadFile(jsonContent, filename, 'application/json;charset=utf-8;');
  };

  const isDisabled = filteredExpenses.length === 0;

  return (
    <div className="flex gap-2">
      <button
        onClick={handleCSVExport}
        disabled={isDisabled}
        className="flex items-center px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        CSV
      </button>
      <button
        onClick={handleJSONExport}
        disabled={isDisabled}
        className="flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        JSON
      </button>
    </div>
  );
}
