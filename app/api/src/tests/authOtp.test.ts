import { beforeEach, describe, expect, it, vi } from 'vitest';

const { generateLink, sendPersonalizedEmail } = vi.hoisted(() => ({
  generateLink: vi.fn(),
  sendPersonalizedEmail: vi.fn()
}));

vi.mock('../config/supabase', () => ({
  supabase: { auth: { admin: { generateLink } } }
}));

vi.mock('../email/email.service', () => ({ sendPersonalizedEmail }));

import { sendAuthOtp } from '../features/auth/auth.service';

describe('sendAuthOtp', () => {
  beforeEach(() => {
    generateLink.mockReset();
    sendPersonalizedEmail.mockReset();
  });

  it('generates an OTP with Supabase and sends it through Resend', async () => {
    generateLink.mockResolvedValue({
      data: { properties: { email_otp: '12345678' } },
      error: null
    });
    sendPersonalizedEmail.mockResolvedValue({ MessageId: 'message-id' });

    await sendAuthOtp('hacker@example.com');

    expect(generateLink).toHaveBeenCalledWith({
      type: 'magiclink',
      email: 'hacker@example.com'
    });
    expect(sendPersonalizedEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'hacker@example.com',
        subject: '12345678 is your SF Hacks login code',
        html: expect.stringContaining('12345678')
      })
    );
  });

  it('does not send an email when Supabase cannot generate a code', async () => {
    generateLink.mockResolvedValue({
      data: null,
      error: { message: 'Auth unavailable' }
    });

    await expect(sendAuthOtp('hacker@example.com')).rejects.toThrow(
      'Unable to generate login code: Auth unavailable'
    );
    expect(sendPersonalizedEmail).not.toHaveBeenCalled();
  });
});
