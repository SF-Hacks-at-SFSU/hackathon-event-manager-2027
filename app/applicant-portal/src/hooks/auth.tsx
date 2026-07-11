import { OtpErrorType } from '@/app/application/types';
import { OTP_LENGTH } from '@/lib/constants';
import { useSupabaseAuth } from '@/providers/SupabaseAuthProvider';
import { User } from '@supabase/supabase-js';
import {
  MutationFunctionContext,
  useMutation,
  useQuery,
  useQueryClient
} from '@tanstack/react-query';
import { useEffect } from 'react';

interface SignupData {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  dob?: string;
}

export function useSignupData() {
  const queryClient = useQueryClient();

  // Save data locally
  const saveSignupData = (data: {
    firstName?: string;
    lastName?: string;
    dob?: string;
    phoneNumber?: string;
  }): void => {
    queryClient.setQueryData(['signupData'], data);
  };

  // Read data (will return undefined if not set)
  const getSignupData = () => {
    return queryClient.getQueryData(['signupData']) as SignupData | undefined;
  };

  // Optional: clear when done
  const clearSignupData = () => {
    queryClient.removeQueries({ queryKey: ['signupData'] });
  };

  const hasSignupData = () => {
    const data = getSignupData();
    return data != null && Object.keys(data).length > 0;
  };

  return { saveSignupData, getSignupData, clearSignupData, hasSignupData };
}

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

export function useVerifyOtp(
  email: string,
  onVerifySuccess: () => void | Promise<void>,
  onError:
    | ((
        error: OtpErrorType,
        variables: string,
        onMutateResult: unknown,
        context: MutationFunctionContext
      ) => Promise<unknown> | unknown)
    | undefined
) {
  const auth = useSupabaseAuth();

  return useMutation<User, OtpErrorType, string>({
    mutationFn: async (otp: string) => {
      if (!otp || otp.length < OTP_LENGTH)
        throw { type: 'INVALID_OTP', message: `Enter the ${OTP_LENGTH}-digit code` };

      const { data, error } = await auth.verifyOtp({
        email,
        token: otp,
        type: 'email'
      });

      if (error) {
        console.error('❌ OTP verification failed:', error);
        throw { type: 'VERIFY_FAIL', message: error.message ?? 'OTP verification failed' };
      }

      if (!data.user) throw { type: 'NO_USER', message: 'No user found.' };

      if (data.session) {
        await auth.setSession(data.session);
      }

      return data.user;
    },

    onSuccess: async () => {
      await onVerifySuccess();
    },

    onError: onError
  });
}

export function useSendOtpMutation(
  onSuccess:
    | ((
        data: boolean,
        variables: string,
        onMutateResult: unknown,
        context: MutationFunctionContext
      ) => Promise<unknown> | unknown)
    | undefined,
  onError:
    | ((
        error: Error,
        variables: string,
        onMutateResult: unknown,
        context: MutationFunctionContext
      ) => Promise<unknown> | unknown)
    | undefined
) {
  const auth = useSupabaseAuth();

  return useMutation({
    mutationFn: async (email: string) => {
      const trimmedEmail = email.trim();
      if (!trimmedEmail) throw new Error('Enter your email');

      const { error } = await auth.signInWithOtp({
        email: trimmedEmail,
        options: {
          // Supabase's default email templates only include a clickable link
          // (customizing them to also show a typed code requires custom SMTP,
          // which is a paid-tier-adjacent setup step). Route the click back
          // here so `/auth/callback` can finish the sign-in.
          emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`
        }
      });
      if (error) throw new Error(error.message);

      return true;
    },
    onSuccess: onSuccess,
    onError: onError
  });
}

export const useUser = () => {
  const sessionQuery = useUserSession();

  const user = sessionQuery.data?.user ?? null;
  const isLoading = sessionQuery.isLoading; // <-- track loading

  return { user, isLoading };
};

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

export const useRefreshProtectedData = () => {
  const queryClient = useQueryClient();

  const refetchUserProfile = async () => {
    await queryClient.refetchQueries({
      queryKey: [['profile', 'me']]
    });
  };

  const refetchEventProfile = async () => {
    await queryClient.refetchQueries({
      queryKey: [['eventProfile', 'me']]
    });
  };

  return { refetchUserProfile, refetchEventProfile };
};
