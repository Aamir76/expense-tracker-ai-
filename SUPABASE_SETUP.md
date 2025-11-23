# Supabase Database Setup Guide

Your expense tracker now supports **Supabase** for reliable cloud storage! Follow these steps to set it up.

## Quick Start (5 minutes)

### 1. Create a Supabase Account
1. Go to [https://supabase.com](https://supabase.com)
2. Sign up for a free account
3. Create a new project:
   - Choose a project name (e.g., "expense-tracker")
   - Set a database password (save this!)
   - Select a region close to you
   - Wait 2 minutes for setup to complete

### 2. Get Your API Credentials
1. In your Supabase project dashboard, click **Settings** (gear icon)
2. Go to **API** section
3. Copy these two values:
   - **Project URL** (under "Project URL")
   - **anon/public key** (under "Project API keys")

### 3. Configure Your App
1. Open the `.env.local` file in your project root
2. Replace the placeholder values:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key-here
   ```

### 4. Create the Database Table
1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy and paste the entire content from `supabase-schema.sql` file
4. Click **Run** to create the expenses table

### 5. Restart Your Dev Server
```bash
# Stop the current server (Ctrl+C)
npm run dev
```

## That's it! 🎉

Your app will now automatically:
- ✅ Store all expenses in Supabase (cloud database)
- ✅ Sync across devices
- ✅ Never lose data again
- ✅ Fallback to localStorage if database is not configured

## Troubleshooting

### "Missing Supabase environment variables"
- Make sure `.env.local` file exists in project root
- Verify you've added both URL and ANON_KEY
- Restart your dev server

### "Failed to fetch expenses"
- Check your Supabase credentials are correct
- Verify you ran the SQL schema
- Check Supabase project is active (not paused)

### Check if database is working
Open browser console and type:
```javascript
localStorage.getItem('using-database')
```
If it returns data, your database is configured!

## Free Tier Limits
Supabase free tier includes:
- 500MB database storage
- 1GB file storage
- 2GB bandwidth
- Unlimited API requests

**Perfect for personal expense tracking!**
