import { Expense } from '@/types/expense';
import { database } from './database';

const STORAGE_KEY = 'expense-tracker-data';

// Check if database is configured
const useDatabase = () => {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
};

// LocalStorage implementation (fallback)
const localStorageImpl = {
  getExpenses(): Expense[] {
    if (typeof window === 'undefined') return [];

    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading expenses from localStorage:', error);
      return [];
    }
  },

  saveExpenses(expenses: Expense[]): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
    } catch (error) {
      console.error('Error saving expenses to localStorage:', error);
    }
  },

  addExpense(expense: Expense): void {
    const expenses = this.getExpenses();
    expenses.push(expense);
    this.saveExpenses(expenses);
  },

  updateExpense(updatedExpense: Expense): void {
    const expenses = this.getExpenses();
    const index = expenses.findIndex(expense => expense.id === updatedExpense.id);
    if (index !== -1) {
      expenses[index] = updatedExpense;
      this.saveExpenses(expenses);
    }
  },

  deleteExpense(id: string): void {
    const expenses = this.getExpenses();
    const filteredExpenses = expenses.filter(expense => expense.id !== id);
    this.saveExpenses(filteredExpenses);
  },

  clearAllExpenses(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
  }
};

// Unified storage interface that chooses backend automatically
export const storage = {
  async getExpenses(): Promise<Expense[]> {
    if (useDatabase()) {
      return await database.getExpenses();
    }
    return localStorageImpl.getExpenses();
  },

  async addExpense(expense: Expense): Promise<Expense> {
    if (useDatabase()) {
      return await database.addExpense(expense);
    }
    localStorageImpl.addExpense(expense);
    return expense;
  },

  async updateExpense(updatedExpense: Expense): Promise<Expense> {
    if (useDatabase()) {
      return await database.updateExpense(updatedExpense);
    }
    localStorageImpl.updateExpense(updatedExpense);
    return updatedExpense;
  },

  async deleteExpense(id: string): Promise<void> {
    if (useDatabase()) {
      await database.deleteExpense(id);
    } else {
      localStorageImpl.deleteExpense(id);
    }
  },

  async clearAllExpenses(): Promise<void> {
    if (useDatabase()) {
      await database.clearAllExpenses();
    } else {
      localStorageImpl.clearAllExpenses();
    }
  },

  // Utility methods
  isUsingDatabase(): boolean {
    return useDatabase();
  },

  // Get localStorage data (for migration)
  getLocalStorageData(): Expense[] {
    return localStorageImpl.getExpenses();
  }
};