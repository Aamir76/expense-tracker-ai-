import { supabase } from './supabase';
import { Expense } from '@/types/expense';

export class DatabaseError extends Error {
  constructor(message: string, public originalError?: unknown) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export const database = {
  async getExpenses(): Promise<Expense[]> {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw new DatabaseError('Failed to fetch expenses', error);

      return (data || []).map(row => ({
        id: row.id,
        amount: Number(row.amount),
        description: row.description,
        category: row.category as Expense['category'],
        date: row.date,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
    } catch (error) {
      console.error('Error loading expenses from database:', error);
      throw error instanceof DatabaseError ? error : new DatabaseError('Failed to load expenses', error);
    }
  },

  async addExpense(expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Promise<Expense> {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert({
          amount: expense.amount,
          description: expense.description,
          category: expense.category,
          date: expense.date,
          payment_method: 'cash', // Default value for compatibility
          tags: [],
        })
        .select()
        .single();

      if (error) throw new DatabaseError('Failed to add expense', error);
      if (!data) throw new DatabaseError('No data returned after insert');

      return {
        id: data.id,
        amount: Number(data.amount),
        description: data.description,
        category: data.category as Expense['category'],
        date: data.date,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (error) {
      console.error('Error adding expense to database:', error);
      throw error instanceof DatabaseError ? error : new DatabaseError('Failed to add expense', error);
    }
  },

  async updateExpense(expense: Expense): Promise<Expense> {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .update({
          amount: expense.amount,
          description: expense.description,
          category: expense.category,
          date: expense.date,
        })
        .eq('id', expense.id)
        .select()
        .single();

      if (error) throw new DatabaseError('Failed to update expense', error);
      if (!data) throw new DatabaseError('Expense not found');

      return {
        id: data.id,
        amount: Number(data.amount),
        description: data.description,
        category: data.category as Expense['category'],
        date: data.date,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (error) {
      console.error('Error updating expense in database:', error);
      throw error instanceof DatabaseError ? error : new DatabaseError('Failed to update expense', error);
    }
  },

  async deleteExpense(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);

      if (error) throw new DatabaseError('Failed to delete expense', error);
    } catch (error) {
      console.error('Error deleting expense from database:', error);
      throw error instanceof DatabaseError ? error : new DatabaseError('Failed to delete expense', error);
    }
  },

  async clearAllExpenses(): Promise<void> {
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows

      if (error) throw new DatabaseError('Failed to clear expenses', error);
    } catch (error) {
      console.error('Error clearing expenses from database:', error);
      throw error instanceof DatabaseError ? error : new DatabaseError('Failed to clear expenses', error);
    }
  },

  // Utility to check if database is configured
  isConfigured(): boolean {
    return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  },
};
