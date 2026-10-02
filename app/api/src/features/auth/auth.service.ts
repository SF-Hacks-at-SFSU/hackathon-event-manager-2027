import { supabase } from '../../config/supabase';
import { sendPersonalizedEmail } from '../../email/email.service';

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export async function sendAuthOtp(email: string) {
  const { data, error } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email
  });

  if (error) {
    throw new Error(`Unable to generate login code: ${error.message}`);
  }

  const otp = data.properties.email_otp;
  if (!otp) {
    throw new Error('Supabase did not return a login code');
  }

  const safeOtp = escapeHtml(otp);
  await sendPersonalizedEmail({
    to: email,
    subject: `${otp} is your SF Hacks login code`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#18181b">
        <h1 style="font-size:24px;margin-bottom:16px">Your SF Hacks login code</h1>
        <p style="font-size:16px;line-height:1.5">Enter this one-time code in the SF Hacks application portal:</p>
        <p style="font-size:32px;font-weight:700;letter-spacing:8px;margin:28px 0">${safeOtp}</p>
        <p style="font-size:14px;line-height:1.5;color:#52525b">If you did not request this code, you can safely ignore this email.</p>
      </div>
    `
  });
}
