'use client';

import { useSupabaseAuth } from '@/providers/SupabaseAuthProvider';
import { Spinner } from '@/components/ui/shadcn-io/spinner';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export function AuthCallback() {
  const auth = useSupabaseAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get('code');
    if (!code) {
      setError('This sign-in link is missing its code. Request a new one and try again.');
      return;
    }

    auth.exchangeCodeForSession(code).then(({ error }) => {
      if (error) {
        setError(error.message);
        return;
      }
      router.replace('/my-dashboard');
    });
  }, [auth, router, searchParams]);

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <p className="text-sm text-destructive">{error}</p>
        <a href="/authenticate" className="text-sm underline underline-offset-2">
          Back to sign in
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <Spinner className="h-6 w-6 animate-spin" />
      <p className="text-sm text-muted-foreground">Signing you in…</p>
    </div>
  );
}
