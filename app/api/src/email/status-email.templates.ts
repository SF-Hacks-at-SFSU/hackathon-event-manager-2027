export interface StatusEmailTemplate {
  subject: string;
  bodyHtml: string;
}

const shell = (heading: string, message: string) => `
  <div style="background:#f5f5f7;padding:40px 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1d1d1f">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:20px;padding:36px">
      <p style="margin:0 0 12px;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#6e6e73">SF Hacks × GDG</p>
      <h1 style="margin:0 0 18px;font-size:30px;line-height:1.15">${heading}</h1>
      <p style="margin:0;font-size:17px;line-height:1.55;color:#424245">Hi {{firstName}},</p>
      <p style="margin:12px 0 0;font-size:17px;line-height:1.55;color:#424245">${message}</p>
      <p style="margin:28px 0 0;font-size:14px;color:#86868b">AI Hackathon · San Francisco State University</p>
    </div>
  </div>
`;

export const statusEmailTemplates: Record<string, StatusEmailTemplate> = {
  application_accepted: {
    subject: 'You’re accepted — SF Hacks × GDG AI Hackathon',
    bodyHtml: shell(
      'You’re in.',
      'Your application has been accepted. Your personal check-in QR is included below and attached to this email. You can also find it in your participant dashboard.'
    )
  },
  application_rejected: {
    subject: 'Your SF Hacks × GDG application update',
    bodyHtml: shell(
      'Application update',
      'Thank you for applying. We’re unable to offer you a spot at this event, but we hope to build with you at a future SF Hacks event.'
    )
  },
  application_waitlisted: {
    subject: 'You’re on the waitlist — SF Hacks × GDG',
    bodyHtml: shell(
      'You’re on the waitlist.',
      'We’ll email you again if a spot becomes available. No action is needed right now.'
    )
  },
  application_pending: {
    subject: 'Your SF Hacks × GDG application is under review',
    bodyHtml: shell(
      'Back under review.',
      'Your application status has returned to pending. We’ll send another update when a decision is ready.'
    )
  }
};

export function getDefaultStatusEmailTemplate(key: string) {
  return statusEmailTemplates[key] ?? null;
}
