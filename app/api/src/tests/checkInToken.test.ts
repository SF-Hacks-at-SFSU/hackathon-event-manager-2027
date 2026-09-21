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
    const token = createEventCheckInToken('event-1');
    const payload = verifyEventCheckInToken(token);

    expect(payload.eventId).toBe('event-1');
    expect(payload).not.toHaveProperty('userId');
    expect(payload).not.toHaveProperty('issuedAt');
    expect(payload.version).toBe(3);
  });

  it('returns the same persistent pass for the same event', () => {
    expect(createEventCheckInToken('event-1')).toBe(createEventCheckInToken('event-1'));
    expect(createEventCheckInToken('event-1')).not.toBe(createEventCheckInToken('event-2'));
  });

  it('rejects a modified pass', () => {
    const token = createEventCheckInToken('event-1');
    const modified = `${token.slice(0, -1)}${token.endsWith('a') ? 'b' : 'a'}`;

    expect(() => verifyEventCheckInToken(modified)).toThrow('could not be verified');
  });

  it('does not expire a persistent event pass', () => {
    const token = createEventCheckInToken('event-1');
    expect(
      verifyEventCheckInToken(token, Date.now() + 10 * 365 * 24 * 60 * 60 * 1_000).eventId
    ).toBe('event-1');
  });
});
