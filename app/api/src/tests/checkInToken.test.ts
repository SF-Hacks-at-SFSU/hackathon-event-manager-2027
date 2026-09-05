import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createCheckInToken, verifyCheckInToken } from '../features/checkIn/checkIn.token';

const originalSecret = process.env.CHECKIN_QR_SECRET;

describe('check-in passes', () => {
  beforeEach(() => {
    process.env.CHECKIN_QR_SECRET = 'test-secret-that-is-longer-than-thirty-two-characters';
  });

  afterEach(() => {
    process.env.CHECKIN_QR_SECRET = originalSecret;
  });

  it('round-trips a signed event and user identity', () => {
    const token = createCheckInToken('event-1', 'user-1');
    const payload = verifyCheckInToken(token);

    expect(payload.eventId).toBe('event-1');
    expect(payload.userId).toBe('user-1');
    expect(payload.version).toBe(1);
  });

  it('rejects a modified pass', () => {
    const token = createCheckInToken('event-1', 'user-1');
    const modified = `${token.slice(0, -1)}${token.endsWith('a') ? 'b' : 'a'}`;

    expect(() => verifyCheckInToken(modified)).toThrow('could not be verified');
  });
});
