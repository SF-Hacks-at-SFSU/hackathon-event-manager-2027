'use client';

import { useSendOtpMutation, useVerifyOtp } from '@/hooks/auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const sendOtp = useSendOtpMutation();
  const verifyOtp = useVerifyOtp(email, () => router.push('/assignments'));

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-4 px-4">
      <h1 className="text-xl font-semibold">Judge sign in</h1>

      {!otpSent ? (
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            sendOtp.mutate(email, { onSuccess: () => setOtpSent(true) });
          }}
        >
          <input
            type="email"
            required
            placeholder="you@example.com"
            className="rounded border px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            type="submit"
            disabled={sendOtp.isPending}
            className="rounded bg-black px-3 py-2 text-white disabled:opacity-50"
          >
            {sendOtp.isPending ? 'Sending…' : 'Send code'}
          </button>
          {sendOtp.isError && <p className="text-sm text-red-600">{sendOtp.error.message}</p>}
        </form>
      ) : (
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            verifyOtp.mutate(otp);
          }}
        >
          <p className="text-sm text-gray-600">Enter the 6-digit code sent to {email}</p>
          <input
            inputMode="numeric"
            required
            placeholder="123456"
            className="rounded border px-3 py-2"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button
            type="submit"
            disabled={verifyOtp.isPending}
            className="rounded bg-black px-3 py-2 text-white disabled:opacity-50"
          >
            {verifyOtp.isPending ? 'Verifying…' : 'Verify'}
          </button>
          {verifyOtp.isError && <p className="text-sm text-red-600">{verifyOtp.error.message}</p>}
        </form>
      )}
    </main>
  );
}
