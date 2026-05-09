'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
}

// Routes that don't require authentication
const publicRoutes = ['/auth/login', '/auth/signup', '/auth/confirm'];

export default function AuthGuard({ children }: AuthGuardProps) {
  const { user, profile, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

    if (!user && !isPublicRoute) {
      // Not authenticated, redirect to login
      router.replace('/auth/login');
    } else if (user && !profile && pathname !== '/onboarding' && !isPublicRoute) {
      // Authenticated but no profile, redirect to onboarding
      router.replace('/onboarding');
    } else if (user && profile && (isPublicRoute || pathname === '/onboarding')) {
      // Authenticated with profile, redirect to dashboard from auth pages
      router.replace('/');
    }
  }, [user, profile, isLoading, router, pathname]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Allow rendering if:
  // 1. Public route
  // 2. Authenticated user on protected route with profile
  // 3. Authenticated user on onboarding without profile
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  const canRender =
    isPublicRoute ||
    (user && profile) ||
    (user && !profile && pathname === '/onboarding');

  if (!canRender) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <>{children}</>;
}
