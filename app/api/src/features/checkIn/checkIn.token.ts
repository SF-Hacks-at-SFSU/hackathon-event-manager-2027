import { createHmac, timingSafeEqual } from 'node:crypto';

interface EventCheckInPayload {
  version: 2;
  eventId: string;
  issuedAt: number;
}

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

export function createEventCheckInToken(eventId: string, issuedAt = Date.now()) {
  const payload: EventCheckInPayload = {
    version: 2,
    eventId,
    issuedAt
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `sfhe1.${encodedPayload}.${sign(encodedPayload)}`;
}

export function verifyEventCheckInToken(token: string, now = Date.now()): EventCheckInPayload {
  const [prefix, encodedPayload, providedSignature] = token.trim().split('.');
  if (prefix !== 'sfhe1' || !encodedPayload || !providedSignature) {
    throw new Error('This is not a valid SF Hacks event check-in code');
  }

  const expectedSignature = sign(encodedPayload);
  const provided = Buffer.from(providedSignature);
  const expected = Buffer.from(expectedSignature);
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    throw new Error('This event check-in code could not be verified');
  }

  let payload: EventCheckInPayload;
  try {
    payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
  } catch {
    throw new Error('This event check-in code is malformed');
  }

  if (
    payload.version !== 2 ||
    typeof payload.eventId !== 'string' ||
    typeof payload.issuedAt !== 'number'
  ) {
    throw new Error('This event check-in code is malformed');
  }

  if (payload.issuedAt > now + CLOCK_SKEW_MS || now - payload.issuedAt > EVENT_PASS_MAX_AGE_MS) {
    throw new Error(
      'This event check-in code has expired. Ask an organizer for the current QR code'
    );
  }

  return payload;
}
