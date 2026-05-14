'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export type Currency = 'USD' | 'EUR' | 'GBP' | 'INR' | 'JPY' | 'CAD' | 'AUD' | 'CNY' | 'PKR';

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
  JPY: '¥',
  CAD: 'C$',
  AUD: 'A$',
  CNY: '¥',
  PKR: '₨',
};

export const CURRENCY_NAMES: Record<Currency, string> = {
  USD: 'US Dollar',
  EUR: 'Euro',
  GBP: 'British Pound',
  INR: 'Indian Rupee',
  JPY: 'Japanese Yen',
  CAD: 'Canadian Dollar',
  AUD: 'Australian Dollar',
  CNY: 'Chinese Yuan',
  PKR: 'Pakistani Rupee',
};

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  getCurrencySymbol: () => string;
  formatAmount: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth();
  const [currency, setCurrencyState] = useState<Currency>('USD');

  useEffect(() => {
    if (profile?.currency && profile.currency in CURRENCY_SYMBOLS) {
      setCurrencyState(profile.currency as Currency);
      try { localStorage.setItem('currency', profile.currency); } catch { /* private browsing */ }
      return;
    }
    // Fall back to cached preference from localStorage
    try {
      const saved = localStorage.getItem('currency') as Currency | null;
      if (saved && saved in CURRENCY_SYMBOLS) setCurrencyState(saved);
    } catch { /* private browsing */ }
  }, [profile]);

  const setCurrency = useCallback((newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    try { localStorage.setItem('currency', newCurrency); } catch { /* private browsing */ }
  }, []);

  const getCurrencySymbol = useCallback(() => CURRENCY_SYMBOLS[currency], [currency]);

  const formatAmount = useCallback(
    (amount: number) => `${CURRENCY_SYMBOLS[currency]}${amount.toFixed(2)}`,
    [currency]
  );

  const value = useMemo(
    () => ({ currency, setCurrency, getCurrencySymbol, formatAmount }),
    [currency, setCurrency, getCurrencySymbol, formatAmount]
  );

  // Always render children — no null gate needed.
  // Children start with USD default and update once profile/localStorage are read.
  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
