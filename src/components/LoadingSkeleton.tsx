'use client';

interface LoadingSkeletonProps {
  variant?: 'list' | 'card' | 'dashboard' | 'form';
  count?: number;
}

function SkeletonPulse({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className || ''}`} />
  );
}

function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg">
      <SkeletonPulse className="w-10 h-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <SkeletonPulse className="h-4 w-3/4" />
        <SkeletonPulse className="h-3 w-1/2" />
      </div>
      <SkeletonPulse className="h-6 w-20" />
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
      <SkeletonPulse className="h-6 w-1/3" />
      <SkeletonPulse className="h-10 w-2/3" />
      <SkeletonPulse className="h-4 w-1/2" />
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>

      {/* Chart area */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <SkeletonPulse className="h-6 w-1/4 mb-4" />
        <SkeletonPulse className="h-48 w-full" />
      </div>

      {/* Recent expenses */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <SkeletonPulse className="h-6 w-1/4 mb-4" />
        <div className="space-y-3">
          <ListItemSkeleton />
          <ListItemSkeleton />
          <ListItemSkeleton />
        </div>
      </div>
    </div>
  );
}

function FormSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
      <SkeletonPulse className="h-6 w-1/4" />
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <SkeletonPulse className="h-4 w-1/3" />
          <SkeletonPulse className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <SkeletonPulse className="h-4 w-1/3" />
          <SkeletonPulse className="h-10 w-full" />
        </div>
      </div>
      <div className="space-y-2">
        <SkeletonPulse className="h-4 w-1/3" />
        <SkeletonPulse className="h-10 w-full" />
      </div>
      <SkeletonPulse className="h-10 w-32" />
    </div>
  );
}

export default function LoadingSkeleton({ variant = 'list', count = 3 }: LoadingSkeletonProps) {
  if (variant === 'dashboard') {
    return <DashboardSkeleton />;
  }

  if (variant === 'form') {
    return <FormSkeleton />;
  }

  if (variant === 'card') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Default: list variant
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <ListItemSkeleton key={i} />
      ))}
    </div>
  );
}
