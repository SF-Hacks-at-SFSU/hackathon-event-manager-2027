import { useSendOtpMutation } from '@/hooks/auth';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import z from 'zod';
const OTPSendRequestFormSchema = z.object({
  email: z.email('Please enter a valid email address.')
});

export function useSendOtp(initialEmail: string = '', returnTo: string = '/my-dashboard') {
  const form = useForm<z.infer<typeof OTPSendRequestFormSchema>>({
    resolver: zodResolver(OTPSendRequestFormSchema),
    defaultValues: { email: initialEmail }
  });

  const router = useRouter();
  const sendOtpMutation = useSendOtpMutation(
    (_, email) => {
      router.push(
        `/verify-otp?email=${encodeURIComponent(email)}&returnTo=${encodeURIComponent(returnTo)}`
      );
    },
    (err) => {
      console.error('Failed to send OTP:', err);
      const errorMessage =
        'Unable to send verification code. Please check your email address and try again.';
      form.setError('email', {
        message: getErrorMessage(err, errorMessage)
      });
    },
    returnTo
  );

  const onSubmit = form.handleSubmit((values) => {
    sendOtpMutation.mutate(values.email);
  });

  return {
    form,
    onSubmit,
    isLoading: sendOtpMutation.isPending
  };
}
