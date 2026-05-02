export interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string; // Category name for display (backward compatible)
  category_id?: string; // Reference to categories table
  date: string;
  createdAt: string;
  updatedAt: string;
  receipt_path?: string;
  user_id?: string;
}

// Legacy type alias for backward compatibility
export type ExpenseCategory = string;

// Legacy constant - kept for components that still reference it
// TODO: Remove after full migration to dynamic categories
export const EXPENSE_CATEGORIES: string[] = [
  'Food & Dining',
  'Transportation',
  'Entertainment',
  'Shopping',
  'Bills & Utilities',
  'Healthcare',
  'Groceries',
  'Subscriptions',
  'Education',
  'Other'
];

export interface ExpenseFilters {
  category?: string;
  category_id?: string;
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
}

export interface ExpenseSummary {
  totalExpenses: number;
  monthlyTotal: number;
  categoryTotals: Record<string, number>;
  expenseCount: number;
}
