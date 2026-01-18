'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
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
  PKR: '₨'
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
  PKR: 'Pakistani Rupee'
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Priority: 1. Profile from database, 2. localStorage fallback
    if (profile?.currency && profile.currency in CURRENCY_SYMBOLS) {
      setCurrencyState(profile.currency as Currency);
      localStorage.setItem('currency', profile.currency);
    } else {
      const savedCurrency = localStorage.getItem('currency') as Currency | null;
      if (savedCurrency && savedCurrency in CURRENCY_SYMBOLS) {
        setCurrencyState(savedCurrency);
      }
    }
    setMounted(true);
  }, [profile]);

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('currency', newCurrency);
  };

  const getCurrencySymbol = () => CURRENCY_SYMBOLS[currency];

  const formatAmount = (amount: number) => {
    const symbol = CURRENCY_SYMBOLS[currency];
    return `${symbol}${amount.toFixed(2)}`;
  };

  // Prevent flash of wrong currency
  if (!mounted) {
    return null;
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, getCurrencySymbol, formatAmount }}>
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
