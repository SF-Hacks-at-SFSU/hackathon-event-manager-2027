import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  createEventCheckInToken,
  verifyEventCheckInToken
} from '../features/checkIn/checkIn.token';

const originalSecret = process.env.CHECKIN_QR_SECRET;

describe('check-in passes', () => {
  beforeEach(() => {
    process.env.CHECKIN_QR_SECRET = 'test-secret-that-is-longer-than-thirty-two-characters';
  });

  afterEach(() => {
    process.env.CHECKIN_QR_SECRET = originalSecret;
  });

  it('round-trips a signed event identity without participant data', () => {
    const token = createEventCheckInToken('event-1', 1_000);
    const payload = verifyEventCheckInToken(token, 2_000);

    expect(payload.eventId).toBe('event-1');
    expect(payload).not.toHaveProperty('userId');
    expect(payload.version).toBe(2);
  });

  it('rejects a modified pass', () => {
    const token = createEventCheckInToken('event-1');
    const modified = `${token.slice(0, -1)}${token.endsWith('a') ? 'b' : 'a'}`;

    expect(() => verifyEventCheckInToken(modified)).toThrow('could not be verified');
  });

  it('rejects a pass older than 24 hours', () => {
    const issuedAt = 1_000;
    const token = createEventCheckInToken('event-1', issuedAt);

    expect(() => verifyEventCheckInToken(token, issuedAt + 24 * 60 * 60 * 1_000 + 1)).toThrow(
      'expired'
    );
  });
});
