'use client';

import { useState, useEffect } from 'react';
import { Category } from '@/types/supabase';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  reassignExpensesToCategory,
  getExpenseCountByCategory,
} from '@/lib/categories';
import { useAuth } from '@/contexts/AuthContext';

const MAX_CATEGORIES = 10;

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981',
  '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280'
];

interface EditingCategory {
  id: string;
  name: string;
  color: string;
}

interface DeleteConfirmState {
  category: Category;
  expenseCount: number;
  targetCategoryId: string;
}

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingCategory, setEditingCategory] = useState<EditingCategory | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', color: PRESET_COLORS[0] });
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState | null>(null);
  const { user } = useAuth();

  const loadCategories = async () => {
    if (!user) return;

    try {
      const data = await getCategories(user.id);
      setCategories(data);
    } catch (err) {
      setError('Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, [user]);

  const handleAddCategory = async () => {
    if (!user || !newCategory.name.trim()) return;

    try {
      setError('');
      await createCategory(user.id, {
        name: newCategory.name.trim(),
        color: newCategory.color,
        sort_order: categories.length,
      });
      setNewCategory({ name: '', color: PRESET_COLORS[0] });
      setIsAdding(false);
      await loadCategories();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add category';
      setError(errorMessage);
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || !editingCategory.name.trim()) return;

    try {
      setError('');
      await updateCategory(editingCategory.id, {
        name: editingCategory.name.trim(),
        color: editingCategory.color,
      });
      setEditingCategory(null);
      await loadCategories();
    } catch (err) {
      setError('Failed to update category');
    }
  };

  const handleDeleteClick = async (category: Category) => {
    const count = await getExpenseCountByCategory(category.id);

    if (count > 0) {
      // Need to reassign expenses first
      const otherCategories = categories.filter(c => c.id !== category.id);
      setDeleteConfirm({
        category,
        expenseCount: count,
        targetCategoryId: otherCategories[0]?.id || '',
      });
    } else {
      // Can delete directly
      await confirmDelete(category.id);
    }
  };

  const confirmDelete = async (categoryId: string) => {
    try {
      setError('');

      if (deleteConfirm?.expenseCount) {
        // Reassign expenses first
        await reassignExpensesToCategory(categoryId, deleteConfirm.targetCategoryId);
      }

      await deleteCategory(categoryId);
      setDeleteConfirm(null);
      await loadCategories();
    } catch (err) {
      setError('Failed to delete category');
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Categories</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {categories.length} of {MAX_CATEGORIES} categories used
          </p>
        </div>
        {categories.length < MAX_CATEGORIES && !isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
          >
            Add Category
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Add new category form */}
      {isAdding && (
        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name
              </label>
              <input
                type="text"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                placeholder="Category name"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Color
              </label>
              <div className="flex gap-1">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewCategory({ ...newCategory, color })}
                    className={`w-6 h-6 rounded-full ${newCategory.color === color ? 'ring-2 ring-offset-1 ring-blue-500' : ''}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <button
              onClick={handleAddCategory}
              disabled={!newCategory.name.trim()}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              Add
            </button>
            <button
              onClick={() => {
                setIsAdding(false);
                setNewCategory({ name: '', color: PRESET_COLORS[0] });
              }}
              className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Category list */}
      <div className="space-y-2">
        {categories.map((category) => (
          <div
            key={category.id}
            className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
          >
            {editingCategory?.id === category.id ? (
              // Edit mode
              <>
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: editingCategory.color }}
                />
                <input
                  type="text"
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800 dark:text-white"
                />
                <div className="flex gap-1">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setEditingCategory({ ...editingCategory, color })}
                      className={`w-5 h-5 rounded-full ${editingCategory.color === color ? 'ring-2 ring-offset-1 ring-blue-500' : ''}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <button
                  onClick={handleUpdateCategory}
                  className="px-2 py-1 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingCategory(null)}
                  className="px-2 py-1 text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                >
                  Cancel
                </button>
              </>
            ) : (
              // View mode
              <>
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: category.color }}
                />
                <span className="flex-1 text-gray-900 dark:text-white">{category.name}</span>
                <button
                  onClick={() => setEditingCategory({
                    id: category.id,
                    name: category.name,
                    color: category.color,
                  })}
                  className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDeleteClick(category)}
                  disabled={categories.length <= 1}
                  className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Reassign Expenses
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              There are <strong>{deleteConfirm.expenseCount}</strong> expenses in &quot;{deleteConfirm.category.name}&quot;.
              Please select a category to move them to:
            </p>
            <select
              value={deleteConfirm.targetCategoryId}
              onChange={(e) => setDeleteConfirm({ ...deleteConfirm, targetCategoryId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white mb-4"
            >
              {categories
                .filter(c => c.id !== deleteConfirm.category.id)
                .map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
            </select>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmDelete(deleteConfirm.category.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete & Reassign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
