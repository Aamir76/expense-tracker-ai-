'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/types/supabase';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Defined outside the component — no closure over state, no re-creation on renders
async function fetchProfile(userId: string, attempt = 0): Promise<Profile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Confirmed: user has no profile row
      // Transient error (cold DB, network blip) — retry before giving up
      if (attempt < 2) {
        await new Promise(r => setTimeout(r, 800 * (attempt + 1)));
        return fetchProfile(userId, attempt + 1);
      }
      console.error('Error fetching profile:', error);
      return null;
    }
    return data;
  } catch {
    if (attempt < 2) {
      await new Promise(r => setTimeout(r, 800 * (attempt + 1)));
      return fetchProfile(userId, attempt + 1);
    }
    return null;
  }
}

// Creates a default profile for brand-new users. Uses INSERT so it never
// overwrites an existing profile. On conflict (23505) the row already exists
// — re-fetch it (handles returning users whose fetchProfile failed transiently).
async function autoCreateProfile(user: User): Promise<Profile | null> {
  const name = (user.email?.split('@')[0] ?? 'User').replace(/[._+\-]/g, ' ').trim();

  const { data, error } = await supabase
    .from('profiles')
    .insert({ id: user.id, name, currency: 'USD' })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      // Row already exists — fetch and return it
      return fetchProfile(user.id);
    }
    console.error('Error creating default profile:', error);
    return null;
  }

  // Seed categories for the new user, non-blocking
  void (async () => {
    const { error } = await supabase.rpc('seed_default_categories', { p_user_id: user.id });
    if (error) console.error('Error seeding categories:', error);
  })();

  return data;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const mountedRef = useRef(true);

  const refreshProfile = async () => {
    if (!user) return;
    const profileData = await fetchProfile(user.id);
    if (mountedRef.current) setProfile(profileData);
  };

  useEffect(() => {
    mountedRef.current = true;

    // Absolute safety net: never stay stuck loading if Supabase is unreachable
    const loadingTimeout = setTimeout(() => {
      if (mountedRef.current) setIsLoading(false);
    }, 10_000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mountedRef.current) return;

        // Token refresh only needs a session pointer update — profile hasn't changed
        if (event === 'TOKEN_REFRESHED') {
          setSession(newSession);
          return;
        }

        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          let profileData = await fetchProfile(newSession.user.id);
          if (!mountedRef.current) return;
          if (profileData === null) {
            profileData = await autoCreateProfile(newSession.user);
            if (!mountedRef.current) return;
          }
          setProfile(profileData);
        } else {
          setProfile(null);
        }

        // Resolve isLoading only after the full auth + profile state is settled.
        // This prevents AuthGuard from ever seeing (user && !profile) mid-flight.
        if (mountedRef.current) {
          clearTimeout(loadingTimeout);
          setIsLoading(false);
        }
      }
    );

    return () => {
      mountedRef.current = false;
      clearTimeout(loadingTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/confirm` },
    });
    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    // onAuthStateChange SIGNED_OUT fires and clears user/profile/session state
    router.push('/auth/login');
  };

  return (
    <AuthContext.Provider
      value={{ user, profile, session, isLoading, signUp, signIn, signOut, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
