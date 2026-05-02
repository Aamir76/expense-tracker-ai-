-- =====================================================
-- Expense Tracker Database Schema
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. User Profiles Table
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  currency TEXT DEFAULT 'USD',
  monthly_budget NUMERIC(12,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can only manage their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- 2. Categories Table
-- =====================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6b7280',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for user queries
CREATE INDEX IF NOT EXISTS categories_user_id_idx ON public.categories(user_id);

-- Enable RLS on categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Users can only manage their own categories
CREATE POLICY "Users can view own categories" ON public.categories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories" ON public.categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories" ON public.categories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories" ON public.categories
  FOR DELETE USING (auth.uid() = user_id);

-- 3. Update Expenses Table (add user_id)
-- =====================================================
-- First, drop existing RLS policies if they exist
DROP POLICY IF EXISTS "Allow all operations for now" ON public.expenses;

-- Add user_id column if it doesn't exist
ALTER TABLE public.expenses
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index on user_id
CREATE INDEX IF NOT EXISTS expenses_user_id_idx ON public.expenses(user_id);

-- Add category_id column for dynamic categories (keep category text for now for backwards compat)
ALTER TABLE public.expenses
  ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL;

-- Create new RLS policies for expenses
CREATE POLICY "Users can view own expenses" ON public.expenses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expenses" ON public.expenses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses" ON public.expenses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses" ON public.expenses
  FOR DELETE USING (auth.uid() = user_id);

-- 4. Receipts Storage Bucket
-- =====================================================
-- Run this separately or via Supabase dashboard:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('receipts', 'receipts', false);

-- Storage policies for receipts
-- Users can only upload to their own folder (folder name = user id)
-- CREATE POLICY "Users upload own receipts" ON storage.objects
--   FOR INSERT WITH CHECK (
--     bucket_id = 'receipts' AND
--     auth.uid()::text = (storage.foldername(name))[1]
--   );

-- CREATE POLICY "Users view own receipts" ON storage.objects
--   FOR SELECT USING (
--     bucket_id = 'receipts' AND
--     auth.uid()::text = (storage.foldername(name))[1]
--   );

-- CREATE POLICY "Users delete own receipts" ON storage.objects
--   FOR DELETE USING (
--     bucket_id = 'receipts' AND
--     auth.uid()::text = (storage.foldername(name))[1]
--   );

-- 5. Helper Functions
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for expenses updated_at (if not already exists)
DROP TRIGGER IF EXISTS update_expenses_updated_at ON public.expenses;
CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON public.expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 6. Default Categories Function
-- =====================================================
-- This function seeds default categories for a new user
CREATE OR REPLACE FUNCTION seed_default_categories(p_user_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO public.categories (user_id, name, color, sort_order) VALUES
    (p_user_id, 'Food & Dining', '#ef4444', 0),
    (p_user_id, 'Transportation', '#06b6d4', 1),
    (p_user_id, 'Entertainment', '#3b82f6', 2),
    (p_user_id, 'Shopping', '#f59e0b', 3),
    (p_user_id, 'Bills & Utilities', '#10b981', 4),
    (p_user_id, 'Healthcare', '#ec4899', 5),
    (p_user_id, 'Groceries', '#84cc16', 6),
    (p_user_id, 'Subscriptions', '#8b5cf6', 7),
    (p_user_id, 'Education', '#14b8a6', 8),
    (p_user_id, 'Other', '#6b7280', 9);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Receipt path migration
-- =====================================================
-- The app now stores the storage path (not a signed URL) in receipt_url.
-- Signed URLs are generated on-demand so they never expire.
-- No column rename is required — the existing receipt_url column holds the path value.
-- If you previously stored signed URLs and want to clear them, run:
-- UPDATE expenses SET receipt_url = NULL WHERE receipt_url LIKE 'https://%';
