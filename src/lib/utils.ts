import { Expense, ExpenseFilters, ExpenseSummary, ExpenseCategory } from '@/types/expense';

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function filterExpenses(expenses: Expense[], filters: ExpenseFilters): Expense[] {
  return expenses.filter(expense => {
    const matchesCategory = !filters.category || expense.category === filters.category;
    const matchesSearch = !filters.searchTerm || 
      expense.description.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      expense.category.toLowerCase().includes(filters.searchTerm.toLowerCase());
    
    const expenseDate = new Date(expense.date);
    const matchesStartDate = !filters.startDate || expenseDate >= new Date(filters.startDate);
    const matchesEndDate = !filters.endDate || expenseDate <= new Date(filters.endDate);

    return matchesCategory && matchesSearch && matchesStartDate && matchesEndDate;
  });
}

export function calculateExpenseSummary(expenses: Expense[]): ExpenseSummary {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  const monthlyExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
  });
  
  const monthlyTotal = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  const categoryTotals: Record<ExpenseCategory, number> = {
    Food: 0,
    Transportation: 0,
    Entertainment: 0,
    Shopping: 0,
    Bills: 0,
    Other: 0
  };

  expenses.forEach(expense => {
    categoryTotals[expense.category] += expense.amount;
  });

  return {
    totalExpenses,
    monthlyTotal,
    categoryTotals,
    expenseCount: expenses.length
  };
}

export function exportToCSV(expenses: Expense[]): string {
  const headers = ['Date', 'Description', 'Category', 'Amount'];
  const csvContent = [
    headers.join(','),
    ...expenses.map(expense => 
      [
        expense.date,
        `"${expense.description}"`,
        expense.category,
        expense.amount.toString()
      ].join(',')
    )
  ].join('\n');

  return csvContent;
}

export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}