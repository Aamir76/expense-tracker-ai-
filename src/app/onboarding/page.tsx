'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨' },
];

export default function OnboardingPage() {
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user, profile, isLoading: authLoading, refreshProfile } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect if not authenticated
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }

    // Redirect if profile already exists
    if (!authLoading && profile) {
      router.push('/');
    }
  }, [user, profile, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!user) {
      setError('Not authenticated');
      return;
    }

    setIsLoading(true);

    try {
      // Upsert so retries and existing-but-undetected profiles are handled gracefully
      const profilePromise = supabase
        .from('profiles')
        .upsert({
          id: user.id,
          name: name.trim(),
          currency,
        }, { onConflict: 'id' });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timed out — your database may be waking up. Please wait a moment and try again.')), 30000)
      );

      const { error: profileError } = await Promise.race([profilePromise, timeoutPromise]) as { error: Error | null };

      if (profileError) {
        throw profileError;
      }

      // Seed default categories (non-blocking, with timeout)
      try {
        const categoriesPromise = supabase.rpc('seed_default_categories', {
          p_user_id: user.id,
        });
        const categoriesTimeout = new Promise((resolve) =>
          setTimeout(() => resolve({ error: { message: 'Categories seeding timed out' } }), 10000)
        );
        const { error: categoriesError } = await Promise.race([categoriesPromise, categoriesTimeout]) as { error: Error | null };

        if (categoriesError) {
          console.error('Error seeding categories:', categoriesError);
          // Don't throw - profile is created, categories can be added manually
        }
      } catch (catErr) {
        console.error('Error seeding categories:', catErr);
        // Continue anyway - profile is created
      }

      // Refresh profile in context
      await refreshProfile();

      // Redirect to dashboard
      router.push('/');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create profile';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome to Expense Tracker
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Let&apos;s set up your account
          </p>
        </div>

        <form className="mt-8 space-y-6 bg-white dark:bg-gray-800 p-8 rounded-lg shadow" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Your name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Preferred currency
              </label>
              <select
                id="currency"
                name="currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
              >
                {CURRENCIES.map((curr) => (
                  <option key={curr.code} value={curr.code}>
                    {curr.symbol} {curr.name} ({curr.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Setting up...' : 'Get Started'}
          </button>
        </form>
      </div>
    </div>
  );
}
