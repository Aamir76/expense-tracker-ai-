'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency, Currency, CURRENCY_SYMBOLS, CURRENCY_NAMES } from '@/contexts/CurrencyContext';
import { supabase } from '@/lib/supabase';
import CategoryManager from './CategoryManager';
import UnifiedExportInterface from './UnifiedExportInterface';
import { Expense } from '@/types/expense';

interface SettingsProps {
  expenses: Expense[];
}

export default function Settings({ expenses }: SettingsProps) {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const { currency, setCurrency } = useCurrency();

  const [name, setName] = useState(profile?.name || '');
  const [monthlyBudget, setMonthlyBudget] = useState<string>(
    profile?.monthly_budget?.toString() || ''
  );
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingBudget, setIsUpdatingBudget] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const currencies: Currency[] = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD', 'CNY', 'PKR'];

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setMonthlyBudget(profile.monthly_budget?.toString() || '');
    }
  }, [profile]);

  const handleUpdateProfile = async () => {
    if (!user || !name.trim()) return;

    setIsUpdatingProfile(true);
    setError('');
    setSuccess('');

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ name: name.trim() })
        .eq('id', user.id);

      if (updateError) throw updateError;

      await refreshProfile();
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError('Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleUpdateBudget = async () => {
    if (!user) return;

    setIsUpdatingBudget(true);
    setError('');
    setSuccess('');

    try {
      const budgetValue = monthlyBudget ? parseFloat(monthlyBudget) : null;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ monthly_budget: budgetValue })
        .eq('id', user.id);

      if (updateError) throw updateError;

      await refreshProfile();
      setSuccess('Budget updated successfully');
    } catch (err) {
      setError('Failed to update budget');
    } finally {
      setIsUpdatingBudget(false);
    }
  };

  const handleCurrencyChange = async (newCurrency: Currency) => {
    if (!user) return;

    setCurrency(newCurrency);

    try {
      await supabase
        .from('profiles')
        .update({ currency: newCurrency })
        .eq('id', user.id);
    } catch (err) {
      console.error('Failed to save currency preference:', err);
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="space-y-8">
      {/* Status messages */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 rounded-lg">
          {success}
        </div>
      )}

      {/* Profile Section */}
      <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Profile</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              />
              <button
                onClick={handleUpdateProfile}
                disabled={isUpdatingProfile || name === profile?.name}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdatingProfile ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Currency Section */}
      <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Currency</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Display Currency
          </label>
          <select
            value={currency}
            onChange={(e) => handleCurrencyChange(e.target.value as Currency)}
            className="w-full max-w-xs px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
          >
            {currencies.map((curr) => (
              <option key={curr} value={curr}>
                {CURRENCY_SYMBOLS[curr]} {CURRENCY_NAMES[curr]} ({curr})
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Budget Section */}
      <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Monthly Budget</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Budget Amount
          </label>
          <div className="flex gap-3">
            <div className="relative flex-1 max-w-xs">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                {CURRENCY_SYMBOLS[currency]}
              </span>
              <input
                type="number"
                value={monthlyBudget}
                onChange={(e) => setMonthlyBudget(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              />
            </div>
            <button
              onClick={handleUpdateBudget}
              disabled={isUpdatingBudget}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isUpdatingBudget ? 'Saving...' : 'Save'}
            </button>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Set a monthly budget to track your spending. Leave empty to disable budget tracking.
          </p>
        </div>
      </section>

      {/* Categories Section */}
      <section>
        <CategoryManager />
      </section>

      {/* Export Section */}
      <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Export Data</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Download all your expense data as CSV or JSON.
        </p>
        <UnifiedExportInterface expenses={expenses} />
      </section>

      {/* Logout Section */}
      <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account</h3>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Sign Out
        </button>
      </section>
    </div>
  );
}
