'use client';

import { useState, useEffect } from 'react';
import { storage } from '@/lib/storage';
import { database } from '@/lib/database';
import { Database, Cloud, HardDrive, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function DatabaseStatus() {
  const [isUsingDatabase, setIsUsingDatabase] = useState(false);
  const [localStorageCount, setLocalStorageCount] = useState(0);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    const checkStatus = () => {
      const usingDb = storage.isUsingDatabase();
      setIsUsingDatabase(usingDb);

      const localData = storage.getLocalStorageData();
      setLocalStorageCount(localData.length);
    };

    checkStatus();
  }, []);

  const handleMigrateData = async () => {
    if (!isUsingDatabase) {
      alert('Please configure Supabase first. See SUPABASE_SETUP.md');
      return;
    }

    const localData = storage.getLocalStorageData();
    if (localData.length === 0) {
      alert('No data found in localStorage to migrate');
      return;
    }

    if (!confirm(`Migrate ${localData.length} expenses from localStorage to Supabase?`)) {
      return;
    }

    setIsMigrating(true);
    setMigrationStatus('idle');

    try {
      // Migrate each expense
      for (const expense of localData) {
        await database.addExpense(expense);
      }

      setMigrationStatus('success');
      alert(`Successfully migrated ${localData.length} expenses to Supabase!`);

      // Refresh the page to load from database
      window.location.reload();
    } catch (error) {
      console.error('Migration error:', error);
      setMigrationStatus('error');
      alert('Failed to migrate data. Check console for details.');
    } finally {
      setIsMigrating(false);
    }
  };

  if (!isUsingDatabase && localStorageCount === 0) {
    return null; // Don't show anything if no database and no local data
  }

  return (
    <div className="fixed bottom-4 right-4 max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {isUsingDatabase ? (
            <Cloud className="w-6 h-6 text-green-500" />
          ) : (
            <HardDrive className="w-6 h-6 text-yellow-500" />
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center">
            <Database className="w-4 h-4 mr-1" />
            Storage Status
          </h3>

          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {isUsingDatabase ? (
              <div className="flex items-center text-green-600 dark:text-green-400">
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Using Supabase (Cloud)
              </div>
            ) : (
              <div className="flex items-center text-yellow-600 dark:text-yellow-400">
                <AlertCircle className="w-4 h-4 mr-1" />
                Using localStorage (Temporary)
              </div>
            )}
          </div>

          {!isUsingDatabase && localStorageCount === 0 && (
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
              Configure Supabase for reliable storage. See SUPABASE_SETUP.md
            </p>
          )}

          {!isUsingDatabase && localStorageCount > 0 && (
            <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
              <p className="text-xs text-yellow-800 dark:text-yellow-200">
                <strong>Warning:</strong> localStorage can be cleared by your browser.
                Set up Supabase to prevent data loss.
              </p>
              <a
                href="/SUPABASE_SETUP.md"
                target="_blank"
                className="text-xs text-yellow-600 dark:text-yellow-400 underline mt-1 inline-block"
              >
                Setup Guide →
              </a>
            </div>
          )}

          {isUsingDatabase && localStorageCount > 0 && (
            <div className="mt-3">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                Found {localStorageCount} expenses in localStorage
              </p>
              <button
                onClick={handleMigrateData}
                disabled={isMigrating}
                className="w-full px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 rounded transition-colors"
              >
                {isMigrating ? 'Migrating...' : 'Migrate to Supabase'}
              </button>
              {migrationStatus === 'success' && (
                <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                  Migration successful!
                </p>
              )}
              {migrationStatus === 'error' && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  Migration failed. Try again.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
