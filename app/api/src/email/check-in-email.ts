import QRCode from 'qrcode';

export interface CheckInEmailAttachment {
  filename: string;
  content: string;
  contentType: string;
  contentId?: string;
}

const DEFAULT_DASHBOARD_URL = 'https://app.sfhacks.io/dashboard';

function safeDashboardUrl(value: string | undefined) {
  if (!value) return DEFAULT_DASHBOARD_URL;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : DEFAULT_DASHBOARD_URL;
  } catch {
    return DEFAULT_DASHBOARD_URL;
  }
}

export async function buildCheckInEmailAssets(token: string, dashboardUrl?: string) {
  const qrCode = await QRCode.toBuffer(token, {
    type: 'png',
    width: 360,
    margin: 2,
    errorCorrectionLevel: 'M'
  });
  const base64Content = qrCode.toString('base64');
  const safeUrl = safeDashboardUrl(dashboardUrl);

  const attachments: CheckInEmailAttachment[] = [
    {
      filename: 'sf-hacks-check-in-qr-inline.png',
      content: base64Content,
      contentType: 'image/png',
      contentId: 'sf-hacks-check-in-qr'
    },
    {
      filename: 'SF-Hacks-check-in-pass.png',
      content: base64Content,
      contentType: 'image/png'
    }
  ];

  const html = `
    <div style="max-width:560px;margin:24px auto;text-align:center;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1d1d1f">
      <h2 style="margin:0 0 8px;font-size:22px">Your check-in QR</h2>
      <p style="margin:0 0 16px;color:#6e6e73">Save this email and show the QR code when you arrive.</p>
      <img src="cid:sf-hacks-check-in-qr" width="280" height="280" alt="Your SF Hacks check-in QR code" style="display:block;margin:0 auto;max-width:100%;background:#ffffff;border:12px solid #ffffff;border-radius:12px" />
      <p style="margin:12px 0 0;font-size:13px;color:#86868b">A downloadable copy is attached as <strong>SF-Hacks-check-in-pass.png</strong>.</p>
      <p style="margin:20px 0 0"><a href="${safeUrl}" style="display:inline-block;border-radius:999px;background:#1d1d1f;padding:12px 20px;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600">Open participant dashboard</a></p>
    </div>
  `;

  return { attachments, html };
}
