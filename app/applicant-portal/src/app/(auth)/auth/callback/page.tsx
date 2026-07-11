import { Spinner } from '@/components/ui/shadcn-io/spinner';
import { Suspense } from 'react';
import { AuthCallback } from './AuthCallback';

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<Spinner className="h-6 w-6 animate-spin" />}>
      <AuthCallback />
    </Suspense>
  );
}
