import { describe, expect, it } from 'vitest';
import { buildCheckInEmailAssets } from '../email/check-in-email';

describe('acceptance email check-in QR', () => {
  it('provides both an inline QR and a normal downloadable PNG attachment', async () => {
    const result = await buildCheckInEmailAssets(
      'sfh1.test-token-for-email-rendering',
      'https://app.sfhacks.io/dashboard'
    );

    expect(result.attachments).toHaveLength(2);
    expect(result.attachments[0].contentId).toBe('sf-hacks-check-in-qr');
    expect(result.attachments[1]).toMatchObject({
      filename: 'SF-Hacks-check-in-pass.png',
      contentType: 'image/png'
    });
    expect(result.attachments[1].contentId).toBeUndefined();
    expect(result.attachments[0].content).toBe(result.attachments[1].content);
    expect(Buffer.from(result.attachments[1].content, 'base64').subarray(0, 8)).toEqual(
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
    );
    expect(result.html).toContain('cid:sf-hacks-check-in-qr');
    expect(result.html).toContain('SF-Hacks-check-in-pass.png');
    expect(result.html).toContain('https://app.sfhacks.io/dashboard');
  });
});
