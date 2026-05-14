import { supabase } from './supabase';
import { Category, CategoryInsert } from '@/types/supabase';

const MAX_CATEGORIES = 10;

export const DEFAULT_CATEGORIES: Omit<CategoryInsert, 'user_id'>[] = [
  { name: 'Food & Dining', color: '#ef4444', sort_order: 0 },
  { name: 'Transportation', color: '#06b6d4', sort_order: 1 },
  { name: 'Entertainment', color: '#3b82f6', sort_order: 2 },
  { name: 'Shopping', color: '#f59e0b', sort_order: 3 },
  { name: 'Bills & Utilities', color: '#10b981', sort_order: 4 },
  { name: 'Healthcare', color: '#ec4899', sort_order: 5 },
  { name: 'Groceries', color: '#84cc16', sort_order: 6 },
  { name: 'Subscriptions', color: '#8b5cf6', sort_order: 7 },
  { name: 'Education', color: '#14b8a6', sort_order: 8 },
  { name: 'Other', color: '#6b7280', sort_order: 9 },
];

export async function getCategories(userId: string): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', userId)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }

  return data || [];
}

export async function createCategory(
  userId: string,
  category: Omit<CategoryInsert, 'user_id' | 'id'>
): Promise<Category> {
  // Check if max categories reached
  const existing = await getCategories(userId);
  if (existing.length >= MAX_CATEGORIES) {
    throw new Error(`Maximum of ${MAX_CATEGORIES} categories allowed`);
  }

  const { data, error } = await supabase
    .from('categories')
    .insert({
      ...category,
      user_id: userId,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating category:', error);
    throw error;
  }

  return data;
}

export async function updateCategory(
  categoryId: string,
  updates: Partial<Pick<Category, 'name' | 'color' | 'sort_order'>>
): Promise<Category> {
  const { data, error } = await supabase
    .from('categories')
    .update(updates)
    .eq('id', categoryId)
    .select()
    .single();

  if (error) {
    console.error('Error updating category:', error);
    throw error;
  }

  return data;
}

export async function deleteCategory(categoryId: string): Promise<void> {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', categoryId);

  if (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
}

export async function reassignExpensesToCategory(
  fromCategoryName: string,
  toCategoryName: string
): Promise<void> {
  const { error } = await supabase
    .from('expenses')
    .update({ category: toCategoryName })
    .eq('category', fromCategoryName);

  if (error) {
    console.error('Error reassigning expenses:', error);
    throw error;
  }
}

export async function getExpenseCountByCategory(categoryId: string): Promise<number> {
  const { count, error } = await supabase
    .from('expenses')
    .select('*', { count: 'exact', head: true })
    .eq('category_id', categoryId);

  if (error) {
    console.error('Error counting expenses:', error);
    return 0;
  }

  return count || 0;
}

export async function reorderCategories(
  userId: string,
  categoryIds: string[]
): Promise<void> {
  const updates = categoryIds.map((id, index) => ({
    id,
    user_id: userId,
    sort_order: index,
  }));

  // Fire all updates in parallel — single network round-trip instead of N sequential ones
  const results = await Promise.all(
    updates.map(({ id, user_id, sort_order }) =>
      supabase
        .from('categories')
        .update({ sort_order })
        .eq('id', id)
        .eq('user_id', user_id)
    )
  );

  const failed = results.find(r => r.error);
  if (failed?.error) {
    console.error('Error reordering categories:', failed.error);
    throw failed.error;
  }
}

export async function seedDefaultCategories(userId: string): Promise<void> {
  const categories = DEFAULT_CATEGORIES.map(cat => ({
    ...cat,
    user_id: userId,
  }));

  const { error } = await supabase
    .from('categories')
    .insert(categories);

  if (error) {
    console.error('Error seeding default categories:', error);
    throw error;
  }
}
