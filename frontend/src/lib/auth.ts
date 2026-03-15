import { cookies } from 'next/headers';
import { createHmac, timingSafeEqual } from 'crypto';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const SESSION_COOKIE = 'admin_session';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Signing key derived from INTERNAL_API_KEY or ADMIN_PASSWORD
const SIGNING_KEY = process.env.INTERNAL_API_KEY || process.env.ADMIN_PASSWORD || 'fallback-dev-key';

function sign(payload: string): string {
  return createHmac('sha256', SIGNING_KEY).update(payload).digest('hex');
}

function verifySignature(payload: string, signature: string): boolean {
  const expected = sign(payload);
  try {
    return timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expected, 'hex'));
  } catch {
    return false;
  }
}

export function validateCredentials(username: string, password: string): boolean {
  // Reject if ADMIN_PASSWORD is not set or empty — prevents open admin access
  if (!ADMIN_PASSWORD) return false;
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}

export async function createSession(): Promise<string> {
  const expiresAt = Date.now() + SESSION_DURATION;
  const sessionId = crypto.randomUUID();
  const payload = `${sessionId}:${expiresAt}`;
  const signature = sign(payload);
  const token = `${payload}:${signature}`;

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: new Date(expiresAt),
    path: '/',
  });

  return sessionId;
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);
  if (!session?.value) return false;

  const parts = session.value.split(':');
  if (parts.length !== 3) return false;

  const [sessionId, expiresAtStr, signature] = parts;
  const payload = `${sessionId}:${expiresAtStr}`;

  // Verify signature — proves the cookie was issued by this server
  if (!verifySignature(payload, signature)) return false;

  // Check expiration
  const expiresAt = parseInt(expiresAtStr, 10);
  if (isNaN(expiresAt) || Date.now() > expiresAt) return false;

  return true;
}
