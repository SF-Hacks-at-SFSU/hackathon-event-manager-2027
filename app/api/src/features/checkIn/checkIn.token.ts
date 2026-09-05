import { createHmac, timingSafeEqual } from 'node:crypto';

interface CheckInPassPayload {
  version: 1;
  eventId: string;
  userId: string;
  issuedAt: number;
}

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

export function createCheckInToken(eventId: string, userId: string) {
  const payload: CheckInPassPayload = {
    version: 1,
    eventId,
    userId,
    issuedAt: Date.now()
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `sfh1.${encodedPayload}.${sign(encodedPayload)}`;
}

export function verifyCheckInToken(token: string): CheckInPassPayload {
  const [prefix, encodedPayload, providedSignature] = token.trim().split('.');
  if (prefix !== 'sfh1' || !encodedPayload || !providedSignature) {
    throw new Error('This is not a valid SF Hacks check-in pass');
  }

  const expectedSignature = sign(encodedPayload);
  const provided = Buffer.from(providedSignature);
  const expected = Buffer.from(expectedSignature);
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    throw new Error('This check-in pass could not be verified');
  }

  let payload: CheckInPassPayload;
  try {
    payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
  } catch {
    throw new Error('This check-in pass is malformed');
  }

  if (
    payload.version !== 1 ||
    typeof payload.eventId !== 'string' ||
    typeof payload.userId !== 'string' ||
    typeof payload.issuedAt !== 'number'
  ) {
    throw new Error('This check-in pass is malformed');
  }

  return payload;
}
