'use client';

import { useState, useEffect } from 'react';
import { Category } from '@/types/supabase';
import { getCategories } from '@/lib/categories';
import { useAuth } from '@/contexts/AuthContext';
import { EXPENSE_CATEGORIES } from '@/types/expense';

interface CategoryPickerProps {
  value: string;
  onChange: (category: string, categoryId?: string) => void;
  disabled?: boolean;
}

export default function CategoryPicker({ value, onChange, disabled }: CategoryPickerProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const loadCategories = async () => {
      if (!user) {
        // Use default categories when not logged in
        setCategories([]);
        setIsLoading(false);
        return;
      }

      try {
        const userCategories = await getCategories(user.id);
        setCategories(userCategories);
      } catch (error) {
        console.error('Error loading categories:', error);
        // Fall back to empty array - will use EXPENSE_CATEGORIES
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, [user]);

  // Use database categories if available, otherwise fall back to legacy constants
  const displayCategories = categories.length > 0
    ? categories
    : EXPENSE_CATEGORIES.map((name, index) => ({
        id: `legacy-${index}`,
        user_id: '',
        name,
        color: '#6b7280',
        sort_order: index,
        created_at: ''
      }));

  const selectedCategory = displayCategories.find(c => c.name === value);

  if (isLoading) {
    return (
      <select disabled className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 dark:bg-gray-700 dark:border-gray-600">
        <option>Loading...</option>
      </select>
    );
  }

  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => {
          const selected = displayCategories.find(c => c.name === e.target.value);
          onChange(e.target.value, selected?.id.startsWith('legacy-') ? undefined : selected?.id);
        }}
        disabled={disabled}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white appearance-none"
        style={{
          paddingLeft: selectedCategory ? '2.5rem' : '0.75rem'
        }}
      >
        <option value="">Select a category</option>
        {displayCategories.map((category) => (
          <option key={category.id} value={category.name}>
            {category.name}
          </option>
        ))}
      </select>

      {/* Color indicator */}
      {selectedCategory && (
        <div
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full"
          style={{ backgroundColor: selectedCategory.color }}
        />
      )}

      {/* Dropdown arrow */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}
