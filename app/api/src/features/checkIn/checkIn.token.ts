import { createHmac, timingSafeEqual } from 'node:crypto';

interface PersistentEventCheckInPayload {
  version: 3;
  eventId: string;
}

interface LegacyEventCheckInPayload {
  version: 2;
  eventId: string;
  issuedAt: number;
}

type EventCheckInPayload = PersistentEventCheckInPayload | LegacyEventCheckInPayload;

const EVENT_PASS_MAX_AGE_MS = 24 * 60 * 60 * 1000;
const CLOCK_SKEW_MS = 5 * 60 * 1000;

function getSigningSecret() {
  const secret = process.env.CHECKIN_QR_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('CHECKIN_QR_SECRET must be configured with at least 32 characters');
  }
  return secret;
}

function sign(encodedPayload: string) {
  return createHmac('sha256', getSigningSecret()).update(encodedPayload).digest('base64url');
}

export function createEventCheckInToken(eventId: string) {
  const payload: PersistentEventCheckInPayload = { version: 3, eventId };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `sfhe2.${encodedPayload}.${sign(encodedPayload)}`;
}

export function verifyEventCheckInToken(token: string, now = Date.now()): EventCheckInPayload {
  const [prefix, encodedPayload, providedSignature] = token.trim().split('.');
  if ((prefix !== 'sfhe1' && prefix !== 'sfhe2') || !encodedPayload || !providedSignature) {
    throw new Error('This is not a valid SF Hacks event check-in code');
  }

  const expectedSignature = sign(encodedPayload);
  const provided = Buffer.from(providedSignature);
  const expected = Buffer.from(expectedSignature);
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    throw new Error('This event check-in code could not be verified');
  }

  let parsedPayload: unknown;
  try {
    parsedPayload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
  } catch {
    throw new Error('This event check-in code is malformed');
  }

  if (!parsedPayload || typeof parsedPayload !== 'object') {
    throw new Error('This event check-in code is malformed');
  }

  const payload = parsedPayload as Partial<EventCheckInPayload>;
  if (typeof payload.eventId !== 'string') {
    throw new Error('This event check-in code is malformed');
  }

  if (prefix === 'sfhe2') {
    if (payload.version !== 3) {
      throw new Error('This event check-in code is malformed');
    }
    return { version: 3, eventId: payload.eventId };
  }

  if (payload.version !== 2 || typeof payload.issuedAt !== 'number') {
    throw new Error('This event check-in code is malformed');
  }

  if (payload.issuedAt > now + CLOCK_SKEW_MS || now - payload.issuedAt > EVENT_PASS_MAX_AGE_MS) {
    throw new Error(
      'This event check-in code has expired. Ask an organizer for the current QR code'
    );
  }

  return { version: 2, eventId: payload.eventId, issuedAt: payload.issuedAt };
}
