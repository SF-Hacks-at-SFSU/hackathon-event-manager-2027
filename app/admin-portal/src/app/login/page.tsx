"use client";

import { useSendOtpMutation, useVerifyOtp } from "@/hooks/auth";
import { OTP_LENGTH } from "@/lib/constants";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const sendOtp = useSendOtpMutation();
  const verifyOtp = useVerifyOtp(email, () => router.push("/dashboard/applications"));

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-5 py-12">
      <div className="pointer-events-none absolute -left-32 -top-36 size-96 rounded-full bg-pink-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-48 -right-32 size-[30rem] rounded-full bg-purple-300/15 blur-3xl" />

      <div className="relative w-full max-w-[430px]">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="grid size-14 place-items-center rounded-[1.15rem] bg-gradient-to-br from-[#f02da7] to-[#95105f] text-sm font-bold text-white shadow-[0_14px_35px_rgba(214,20,134,0.25)]">
            SF
          </div>
          <p className="mt-5 text-sm font-semibold tracking-[-0.02em]">SF Hacks</p>
          <p className="mt-1 text-xs text-gray-500">Organizer console</p>
        </div>

        <section className="admin-card p-6 sm:p-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold tracking-[-0.04em] text-gray-950">
              {otpSent ? "Check your inbox" : "Welcome back"}
            </h1>
            <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-gray-500">
              {otpSent
                ? `Enter the ${OTP_LENGTH}-digit verification code sent to ${email}.`
                : "Sign in with your authorized organizer email to manage the event."}
            </p>
          </div>

          {!otpSent ? (
            <form
              className="mt-7"
              onSubmit={(event) => {
                event.preventDefault();
                sendOtp.mutate(email, { onSuccess: () => setOtpSent(true) });
              }}
            >
              <label className="block text-xs font-semibold text-gray-600">
                Email address
                <input
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="organizer@sfhacks.io"
                  className="admin-input mt-2 text-sm font-normal"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </label>
              <button type="submit" disabled={sendOtp.isPending} className="admin-button mt-5 w-full">
                {sendOtp.isPending ? "Sending code…" : "Continue"}
              </button>
              {sendOtp.isError && (
                <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700" role="alert">
                  {sendOtp.error.message}
                </p>
              )}
            </form>
          ) : (
            <form
              className="mt-7"
              onSubmit={(event) => {
                event.preventDefault();
                verifyOtp.mutate(otp);
              }}
            >
              <label className="block text-xs font-semibold text-gray-600">
                Verification code
                <input
                  inputMode="numeric"
                  required
                  autoComplete="one-time-code"
                  placeholder={"0".repeat(OTP_LENGTH)}
                  maxLength={OTP_LENGTH}
                  className="admin-input mt-2 text-center text-lg font-semibold tracking-[0.32em]"
                  value={otp}
                  onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))}
                  autoFocus
                />
              </label>
              <button type="submit" disabled={verifyOtp.isPending} className="admin-button mt-5 w-full">
                {verifyOtp.isPending ? "Verifying…" : "Sign in"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setOtpSent(false);
                  setOtp("");
                }}
                className="mt-3 w-full rounded-full py-2 text-sm font-medium text-gray-500 transition hover:text-gray-950"
              >
                Use a different email
              </button>
              {verifyOtp.isError && (
                <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700" role="alert">
                  {verifyOtp.error.message}
                </p>
              )}
            </form>
          )}
        </section>

        <p className="mt-6 text-center text-[11px] leading-5 text-gray-400">
          Access is limited to approved SF Hacks organizers.
        </p>
      </div>
    </main>
  );
}
