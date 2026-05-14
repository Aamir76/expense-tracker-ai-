import { supabase } from './supabase';
import { Expense } from '@/types/expense';
import { Database } from '@/types/supabase';

export class DatabaseError extends Error {
  constructor(message: string, public originalError?: unknown) {
    super(message);
    this.name = 'DatabaseError';
  }
}

// Type for database row from Supabase
type DatabaseExpense = Database['public']['Tables']['expenses']['Row'];
type DatabaseExpenseInsert = Database['public']['Tables']['expenses']['Insert'];
type DatabaseExpenseUpdate = Database['public']['Tables']['expenses']['Update'];

export const database = {
  async getExpenses(): Promise<Expense[]> {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('id, amount, description, category, date, created_at, updated_at, receipt_url')
        .order('date', { ascending: false });

      if (error) throw new DatabaseError('Failed to fetch expenses', error);

      return ((data as DatabaseExpense[]) || []).map(row => ({
        id: row.id,
        amount: Number(row.amount),
        description: row.description,
        category: row.category as Expense['category'],
        date: row.date,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        receipt_path: row.receipt_url || undefined,
      }));
    } catch (error) {
      console.error('Error loading expenses from database:', error);
      throw error instanceof DatabaseError ? error : new DatabaseError('Failed to load expenses', error);
    }
  },

  async addExpense(expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Promise<Expense> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new DatabaseError('User not authenticated');

      const insertData: DatabaseExpenseInsert = {
        user_id: user.id,
        amount: expense.amount,
        description: expense.description,
        category: expense.category,
        date: expense.date,
        payment_method: 'cash',
        tags: [],
        receipt_url: expense.receipt_path || null,
      };

      const { data, error } = await supabase
        .from('expenses')
        // @ts-ignore - Supabase type inference issue
        .insert(insertData)
        .select()
        .single();

      if (error) throw new DatabaseError('Failed to add expense', error);
      if (!data) throw new DatabaseError('No data returned after insert');

      const dbData = data as DatabaseExpense;
      return {
        id: dbData.id,
        amount: Number(dbData.amount),
        description: dbData.description,
        category: dbData.category as Expense['category'],
        date: dbData.date,
        createdAt: dbData.created_at,
        updatedAt: dbData.updated_at,
        receipt_path: dbData.receipt_url || undefined,
      };
    } catch (error) {
      console.error('Error adding expense to database:', error);
      throw error instanceof DatabaseError ? error : new DatabaseError('Failed to add expense', error);
    }
  },

  async updateExpense(expense: Expense): Promise<Expense> {
    try {
      const updateData: DatabaseExpenseUpdate = {
        amount: expense.amount,
        description: expense.description,
        category: expense.category,
        date: expense.date,
        receipt_url: expense.receipt_path || null,
      };

      const { data, error } = await supabase
        .from('expenses')
        // @ts-ignore - Supabase type inference issue
        .update(updateData)
        .eq('id', expense.id)
        .select()
        .single();

      if (error) throw new DatabaseError('Failed to update expense', error);
      if (!data) throw new DatabaseError('Expense not found');

      const dbData = data as DatabaseExpense;
      return {
        id: dbData.id,
        amount: Number(dbData.amount),
        description: dbData.description,
        category: dbData.category as Expense['category'],
        date: dbData.date,
        createdAt: dbData.created_at,
        updatedAt: dbData.updated_at,
        receipt_path: dbData.receipt_url || undefined,
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
