'use client';

import { useSupabaseAuth } from '@/providers/SupabaseAuthProvider';
import { OTP_LENGTH } from '@/lib/constants';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

export const useUserSession = () => {
  const auth = useSupabaseAuth();
  const client = useQueryClient();

  useEffect(() => {
    const { data: listener } = auth.onAuthStateChange((_event, session) => {
      client.setQueryData(['user'], session);
    });

    return () => listener.subscription.unsubscribe();
  }, [auth, client]);

  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const {
        data: { session }
      } = await auth.getSession();
      return session;
    },
    staleTime: Infinity
  });
};

export const useUser = () => {
  const sessionQuery = useUserSession();
  return { user: sessionQuery.data?.user ?? null, isLoading: sessionQuery.isLoading };
};

export function useSendOtpMutation() {
  const auth = useSupabaseAuth();

  return useMutation({
    mutationFn: async (email: string) => {
      const trimmedEmail = email.trim();
      if (!trimmedEmail) throw new Error('Enter your email');

      const { error } = await auth.signInWithOtp({ email: trimmedEmail });
      if (error) throw new Error(error.message);

      return true;
    }
  });
}

export function useVerifyOtp(email: string, onVerifySuccess: () => void) {
  const auth = useSupabaseAuth();

  return useMutation({
    mutationFn: async (otp: string) => {
      if (!otp || otp.length < OTP_LENGTH) throw new Error(`Enter the ${OTP_LENGTH}-digit code`);

      const { data, error } = await auth.verifyOtp({ email, token: otp, type: 'email' });
      if (error) throw new Error(error.message);
      if (data.session) await auth.setSession(data.session);

      return data.user;
    },
    onSuccess: onVerifySuccess
  });
}

export const useSignOut = () => {
  const auth = useSupabaseAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { error } = await auth.signOut();
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.clear();
      queryClient.setQueryData(['user'], null);
    }
  });
};
