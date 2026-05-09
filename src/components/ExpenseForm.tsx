'use client';

import { useState, useRef, useEffect } from 'react';
import { Expense, ExpenseCategory, EXPENSE_CATEGORIES } from '@/types/expense';
import { generateId } from '@/lib/utils';
import { uploadReceipt, validateReceiptFile, getSignedReceiptUrl, deleteReceipt } from '@/lib/receipts';
import { useAuth } from '@/contexts/AuthContext';

interface ExpenseFormProps {
  onSubmit: (expense: Expense) => void;
  initialData?: Expense;
  onCancel?: () => void;
}

export default function ExpenseForm({ onSubmit, initialData, onCancel }: ExpenseFormProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    amount: initialData?.amount?.toString() || '',
    description: initialData?.description || '',
    category: initialData?.category || 'Other' as ExpenseCategory,
    date: initialData?.date || new Date().toISOString().split('T')[0]
  });

  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [existingReceiptRemoved, setExistingReceiptRemoved] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setExistingReceiptRemoved(false);
    if (initialData?.receipt_path) {
      getSignedReceiptUrl(initialData.receipt_path).then(url => {
        if (url) setReceiptPreview(url);
      });
    } else {
      setReceiptPreview(null);
    }
  }, [initialData?.id]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const expenseId = initialData?.id || generateId();
      let receiptPath: string | undefined = existingReceiptRemoved ? undefined : initialData?.receipt_path;

      if (receiptFile && user) {
        try {
          const result = await uploadReceipt(user.id, expenseId, receiptFile);
          receiptPath = result.path;
        } catch (uploadError) {
          console.error('Error uploading receipt:', uploadError);
          setErrors(prev => ({ ...prev, receipt: 'Failed to upload receipt. Expense will be saved without it.' }));
        }
      }

      if (existingReceiptRemoved && !receiptFile && user) {
        try {
          await deleteReceipt(user.id, expenseId);
        } catch (err) {
          console.error('Error deleting receipt from storage:', err);
        }
      }

      const expense: Expense = {
        id: expenseId,
        amount: parseFloat(formData.amount),
        description: formData.description.trim(),
        category: formData.category,
        date: formData.date,
        createdAt: initialData?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        receipt_path: receiptPath,
      };

      onSubmit(expense);

      if (!initialData) {
        setFormData({
          amount: '',
          description: '',
          category: 'Other',
          date: new Date().toISOString().split('T')[0]
        });
        setReceiptFile(null);
        setReceiptPreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (error) {
      console.error('Error submitting expense:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setReceiptFile(null);
      if (initialData?.receipt_path) {
        getSignedReceiptUrl(initialData.receipt_path).then(url => setReceiptPreview(url));
      } else {
        setReceiptPreview(null);
      }
      return;
    }

    const validationError = validateReceiptFile(file);
    if (validationError) {
      setErrors(prev => ({ ...prev, receipt: validationError }));
      return;
    }

    setErrors(prev => ({ ...prev, receipt: '' }));
    setReceiptFile(file);

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setReceiptPreview(previewUrl);
  };

  const handleRemoveReceipt = () => {
    if (receiptFile) {
      // Cancelling a newly selected file — revert to the saved receipt if there is one
      setReceiptFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (initialData?.receipt_path && !existingReceiptRemoved) {
        getSignedReceiptUrl(initialData.receipt_path).then(url => setReceiptPreview(url));
      } else {
        setReceiptPreview(null);
      }
    } else {
      // Removing the existing saved receipt
      setExistingReceiptRemoved(true);
      setReceiptPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
        {initialData ? 'Edit Expense' : 'Add New Expense'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Amount
          </label>
          <input
            type="number"
            id="amount"
            step="0.01"
            min="0"
            value={formData.amount}
            onChange={(e) => handleInputChange('amount', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.amount ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
            placeholder="0.00"
            disabled={isSubmitting}
          />
          {errors.amount && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.amount}</p>}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <input
            type="text"
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
            placeholder="Enter expense description"
            disabled={isSubmitting}
          />
          {errors.description && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>}
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Category
          </label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            disabled={isSubmitting}
          >
            {EXPENSE_CATEGORIES.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Date
          </label>
          <input
            type="date"
            id="date"
            value={formData.date}
            onChange={(e) => handleInputChange('date', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.date ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
            disabled={isSubmitting}
          />
          {errors.date && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.date}</p>}
        </div>

        {/* Receipt Upload (Optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Receipt <span className="text-gray-400 font-normal">(optional)</span>
          </label>

          {receiptPreview ? (
            <div className="relative">
              <div className="border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-gray-50 dark:bg-gray-700">
                <div className="flex items-center gap-3">
                  <img
                    src={receiptPreview}
                    alt="Receipt preview"
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
                      {receiptFile?.name || 'Current receipt'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {receiptFile ? `${(receiptFile.size / 1024).toFixed(1)} KB` : 'Uploaded'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveReceipt}
                    disabled={isSubmitting}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    title="Remove receipt"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md p-4 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Click to upload receipt
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                JPG, PNG, or WebP (max 5MB)
              </p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
            disabled={isSubmitting}
          />
          {errors.receipt && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.receipt}</p>}
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Saving...' : (initialData ? 'Update Expense' : 'Add Expense')}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}