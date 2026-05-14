'use client';

import { useCurrency } from '@/contexts/CurrencyContext';

interface BudgetBarProps {
  budget: number | null;
  spent: number;
  onEditClick?: () => void;
}

export default function BudgetBar({ budget, spent, onEditClick }: BudgetBarProps) {
  const { formatAmount } = useCurrency();

  // No budget set
  if (!budget) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Monthly Budget</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Set a budget to track your spending
            </p>
          </div>
          {onEditClick && (
            <button
              onClick={onEditClick}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
            >
              Set Budget
            </button>
          )}
        </div>
      </div>
    );
  }

  const percentage = Math.min((spent / budget) * 100, 100);
  const remaining = budget - spent;
  const isOverBudget = spent > budget;

  // Determine color based on percentage
  let barColor = 'bg-green-500';
  let textColor = 'text-green-600 dark:text-green-400';
  if (percentage >= 90) {
    barColor = 'bg-red-500';
    textColor = 'text-red-600 dark:text-red-400';
  } else if (percentage >= 75) {
    barColor = 'bg-yellow-500';
    textColor = 'text-yellow-600 dark:text-yellow-400';
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Monthly Budget</h3>
        {onEditClick && (
          <button
            onClick={onEditClick}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
          >
            Edit
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div className="relative h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-3">
        <div
          className={`absolute inset-y-0 left-0 right-0 origin-left ${barColor} transition-transform duration-300`}
          style={{ transform: `scaleX(${percentage / 100})` }}
        />
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-sm">
        <div>
          <span className="text-gray-900 dark:text-white font-medium">
            {formatAmount(spent)}
          </span>
          <span className="text-gray-500 dark:text-gray-400">
            {' '}of {formatAmount(budget)}
          </span>
        </div>
        <div className={textColor}>
          {isOverBudget ? (
            <span>{formatAmount(Math.abs(remaining))} over budget</span>
          ) : (
            <span>{Math.round(percentage)}% used</span>
          )}
        </div>
      </div>

      {/* Remaining or over budget indicator */}
      {!isOverBudget && remaining > 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          {formatAmount(remaining)} remaining this month
        </p>
      )}
    </div>
  );
}
