import { Expense } from '@/types/expense';

// Base export interface
export interface ExportOptions {
  filename?: string;
  dateRange?: {
    start?: string;
    end?: string;
  };
  categories?: string[];
  format?: 'csv' | 'json' | 'pdf';
}

// Export system tiers
export interface ExportSystem {
  basic: SimpleCSVExport;
  advanced: MultiFormatExport;
  cloud: CloudExportHub;
}

// Tier 1: Simple CSV Export (V1 approach)
export interface SimpleCSVExport {
  exportToCSV: (expenses: Expense[], options?: Pick<ExportOptions, 'filename'>) => void;
}

// Tier 2: Advanced Multi-Format (V2 approach)
export interface MultiFormatExport {
  openModal: (expenses: Expense[]) => void;
  exportWithFilters: (expenses: Expense[], options: ExportOptions) => Promise<void>;
}

// Tier 3: Cloud Integration (V3 approach)
export interface CloudExportHub {
  openWorkspace: (expenses: Expense[]) => void;
  exportWithTemplate: (expenses: Expense[], templateId: string) => Promise<void>;
  shareExport: (exportId: string) => Promise<string>;
}

// Core export utilities (foundation from V1)
export class BaseExportUtils {
  static generateCSV(expenses: Expense[]): string {
    const headers = ['Date', 'Description', 'Category', 'Amount'];
    const rows = expenses.map(expense => [
      expense.date,
      `"${expense.description.replace(/"/g, '""')}"`,
      expense.category,
      expense.amount.toString()
    ]);

    return [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
  }

  static generateJSON(expenses: Expense[], metadata?: any): string {
    const exportData = {
      exportedAt: new Date().toISOString(),
      totalRecords: expenses.length,
      metadata: metadata || {},
      expenses: expenses
    };
    return JSON.stringify(exportData, null, 2);
  }

  static downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }

  static filterExpenses(expenses: Expense[], options: ExportOptions): Expense[] {
    let filtered = [...expenses];

    // Date range filtering
    if (options.dateRange?.start) {
      filtered = filtered.filter(expense => expense.date >= options.dateRange!.start!);
    }
    if (options.dateRange?.end) {
      filtered = filtered.filter(expense => expense.date <= options.dateRange!.end!);
    }

    // Category filtering
    if (options.categories && options.categories.length > 0) {
      filtered = filtered.filter(expense => options.categories!.includes(expense.category));
    }

    return filtered;
  }

  static generateFilename(prefix: string, format: string): string {
    const date = new Date().toISOString().split('T')[0];
    return `${prefix}_${date}.${format}`;
  }
}

// Implementation of Tier 1: Simple CSV Export
export class SimpleCSVExportImpl implements SimpleCSVExport {
  exportToCSV(expenses: Expense[], options?: Pick<ExportOptions, 'filename'>): void {
    const csvContent = BaseExportUtils.generateCSV(expenses);
    const filename = options?.filename || BaseExportUtils.generateFilename('expenses', 'csv');
    BaseExportUtils.downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
  }
}

// Advanced export implementation with PDF support
export class AdvancedExportImpl {
  static async generatePDF(expenses: Expense[], options: ExportOptions): Promise<void> {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();

    // Title
    doc.setFontSize(20);
    doc.text('Expense Report', 20, 20);

    // Export info
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 30);
    doc.text(`Total Records: ${expenses.length}`, 20, 35);

    // Filter info
    if (options.dateRange?.start || options.categories?.length) {
      let filterText = 'Filters: ';
      if (options.dateRange?.start) {
        filterText += `Date: ${options.dateRange.start} to ${options.dateRange?.end || 'present'}`;
      }
      if (options.categories?.length) {
        if (filterText !== 'Filters: ') filterText += ', ';
        filterText += `Categories: ${options.categories.join(', ')}`;
      }
      doc.text(filterText, 20, 40);
    }

    // Table headers
    doc.setFontSize(12);
    const headers = ['Date', 'Description', 'Category', 'Amount'];
    let y = 55;
    
    doc.setFont('helvetica', 'bold');
    headers.forEach((header, index) => {
      doc.text(header, 20 + (index * 45), y);
    });

    // Table data
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    expenses.forEach((expense, index) => {
      y += 8;
      
      // Page break if needed
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
      
      doc.text(expense.date, 20, y);
      doc.text(expense.description.length > 20 ? expense.description.substring(0, 20) + '...' : expense.description, 65, y);
      doc.text(expense.category, 110, y);
      doc.text(`$${expense.amount.toFixed(2)}`, 155, y);
    });

    // Summary
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    y += 15;
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    
    doc.setFont('helvetica', 'bold');
    doc.text(`Total: $${total.toFixed(2)}`, 155, y);

    // Save
    const filename = options.filename || BaseExportUtils.generateFilename('expenses_report', 'pdf');
    doc.save(filename);
  }
}

// Factory for creating the export system
export class ExportSystemFactory {
  static create(): ExportSystem {
    return {
      basic: new SimpleCSVExportImpl(),
      advanced: {
        openModal: (expenses: Expense[]) => {
          // Will be implemented with modal component
          console.log('Opening advanced export modal with', expenses.length, 'expenses');
        },
        exportWithFilters: async (expenses: Expense[], options: ExportOptions) => {
          const filtered = BaseExportUtils.filterExpenses(expenses, options);
          
          switch (options.format) {
            case 'csv':
              const csvContent = BaseExportUtils.generateCSV(filtered);
              const csvFilename = options.filename || BaseExportUtils.generateFilename('expenses_filtered', 'csv');
              BaseExportUtils.downloadFile(csvContent, csvFilename, 'text/csv;charset=utf-8;');
              break;
              
            case 'json':
              const jsonContent = BaseExportUtils.generateJSON(filtered, {
                filters: options.dateRange || options.categories ? {
                  dateRange: options.dateRange,
                  categories: options.categories
                } : undefined
              });
              const jsonFilename = options.filename || BaseExportUtils.generateFilename('expenses_filtered', 'json');
              BaseExportUtils.downloadFile(jsonContent, jsonFilename, 'application/json;charset=utf-8;');
              break;
              
            case 'pdf':
              await AdvancedExportImpl.generatePDF(filtered, options);
              break;
          }
        }
      },
      cloud: {
        openWorkspace: (expenses: Expense[]) => {
          // Will be implemented with workspace component
          console.log('Opening cloud workspace with', expenses.length, 'expenses');
        },
        exportWithTemplate: async (expenses: Expense[], templateId: string) => {
          console.log('Exporting with template:', templateId);
        },
        shareExport: async (exportId: string) => {
          return `https://example.com/shared/${exportId}`;
        }
      }
    };
  }
}