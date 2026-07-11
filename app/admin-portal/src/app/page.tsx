'use client';

import { useUser } from '@/hooks/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    router.replace(user ? '/dashboard/applications' : '/login');
  }, [isLoading, user, router]);

  return null;
}
