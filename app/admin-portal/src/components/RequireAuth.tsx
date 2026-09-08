'use client';

import { useUser } from '@/hooks/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#f5f5f7]">
        <div className="flex items-center gap-3 text-sm font-medium text-gray-500">
          <span className="size-2 animate-pulse rounded-full bg-[#d41486]" />
          Preparing your workspace…
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
