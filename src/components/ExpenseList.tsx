'use client';

import { useState, useMemo, memo } from 'react';
import { Expense } from '@/types/expense';
import { Category } from '@/types/supabase';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useCurrency } from '@/contexts/CurrencyContext';
import { getSignedReceiptUrl } from '@/lib/receipts';
import ReceiptViewer from './ReceiptViewer';

interface ExpenseListProps {
  expenses: Expense[];
  categories: Category[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
  onUpdateCategory: (id: string, category: string) => void;
}

function ExpenseList({ expenses, categories, onEdit, onDelete, onUpdateCategory }: ExpenseListProps) {
  const { currency } = useCurrency();
  const [viewingReceipt, setViewingReceipt] = useState<string | null>(null);
  const [loadingReceiptId, setLoadingReceiptId] = useState<string | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);

  const categoryMap = useMemo(
    () => Object.fromEntries(categories.map(c => [c.name, c])),
    [categories]
  );

  const handleViewReceipt = async (expenseId: string, receiptPath: string) => {
    setLoadingReceiptId(expenseId);
    try {
      const url = await getSignedReceiptUrl(receiptPath);
      if (url) {
        setViewingReceipt(url);
      }
    } finally {
      setLoadingReceiptId(null);
    }
  };

  if (expenses.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center transition-colors">
        <div className="text-gray-400 dark:text-gray-600 text-6xl mb-4">📝</div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No expenses found</h3>
        <p className="text-gray-500 dark:text-gray-400">
          {expenses.length === 0 ? 'Add your first expense to get started!' : 'Try adjusting your filters.'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-colors">

      {/* ── Mobile card layout (hidden on md+) ─────────────────────────── */}
      <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
        {expenses.map((expense) => (
          <div key={expense.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <div className="flex justify-between items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{expense.description}</p>
                  {expense.receipt_path && (
                    <button
                      onClick={() => handleViewReceipt(expense.id, expense.receipt_path!)}
                      disabled={loadingReceiptId === expense.id}
                      className="p-2 -m-2 shrink-0 text-gray-400 hover:text-blue-500 transition-colors disabled:opacity-50"
                      title="View receipt"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{formatDate(expense.date)}</p>
              </div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white shrink-0">
                {formatCurrency(expense.amount, currency)}
              </p>
            </div>
            <div className="flex items-center justify-between mt-3">
              {editingCategoryId === expense.id ? (
                <select
                  autoFocus
                  defaultValue={expense.category}
                  onChange={(e) => { onUpdateCategory(expense.id, e.target.value); setEditingCategoryId(null); }}
                  onBlur={() => setEditingCategoryId(null)}
                  className="text-xs border border-gray-300 dark:border-gray-600 rounded px-1 py-0.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {!categoryMap[expense.category] && (
                    <option value={expense.category} disabled>{expense.category} (deleted)</option>
                  )}
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              ) : (
                <button
                  onClick={() => setEditingCategoryId(expense.id)}
                  className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:opacity-75 transition-opacity"
                >
                  <span
                    className="w-2 h-2 rounded-full inline-block shrink-0"
                    style={{ backgroundColor: categoryMap[expense.category]?.color ?? '#6b7280' }}
                  />
                  {expense.category}
                </button>
              )}
              <div className="flex gap-4">
                <button
                  onClick={() => onEdit(expense)}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(expense.id)}
                  className="text-sm text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Desktop table layout (hidden below md) ──────────────────────── */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {expenses.map((expense) => (
              <tr key={expense.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {formatDate(expense.date)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                  <div className="flex items-center gap-2">
                    <span className="max-w-xs truncate">{expense.description}</span>
                    {expense.receipt_path && (
                      <button
                        onClick={() => handleViewReceipt(expense.id, expense.receipt_path!)}
                        disabled={loadingReceiptId === expense.id}
                        className="p-2 -m-2 text-gray-400 hover:text-blue-500 transition-colors disabled:opacity-50"
                        title="View receipt"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </button>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingCategoryId === expense.id ? (
                    <select
                      autoFocus
                      defaultValue={expense.category}
                      onChange={(e) => {
                        onUpdateCategory(expense.id, e.target.value);
                        setEditingCategoryId(null);
                      }}
                      onBlur={() => setEditingCategoryId(null)}
                      className="text-xs border border-gray-300 dark:border-gray-600 rounded px-1 py-0.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {!categoryMap[expense.category] && (
                        <option value={expense.category} disabled>{expense.category} (deleted)</option>
                      )}
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  ) : (
                    <button
                      onClick={() => setEditingCategoryId(expense.id)}
                      className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:opacity-75 transition-opacity"
                    >
                      <span
                        className="w-2 h-2 rounded-full inline-block flex-shrink-0"
                        style={{ backgroundColor: categoryMap[expense.category]?.color ?? '#6b7280' }}
                      />
                      {expense.category}
                    </button>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {formatCurrency(expense.amount, currency)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onEdit(expense)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(expense.id)}
                      className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>{/* end desktop table wrapper */}

      <div className="bg-gray-50 dark:bg-gray-900 px-6 py-3 border-t border-gray-200 dark:border-gray-700 transition-colors">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Showing {expenses.length} expense{expenses.length !== 1 ? 's' : ''}
        </div>
      </div>

      {viewingReceipt && (
        <ReceiptViewer
          receiptUrl={viewingReceipt}
          onClose={() => setViewingReceipt(null)}
        />
      )}
    </div>
  );
}

export default memo(ExpenseList);