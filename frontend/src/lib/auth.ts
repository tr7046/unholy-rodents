import { cookies } from 'next/headers';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const SESSION_COOKIE = 'admin_session';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// In-memory session store — sessions survive within a single server process lifetime.
// For multi-instance deployments, replace with Redis or DB-backed sessions.
const activeSessions = new Map<string, number>(); // sessionId → expiresAt timestamp

export function validateCredentials(username: string, password: string): boolean {
  // Reject if ADMIN_PASSWORD is not set or empty — prevents open admin access
  if (!ADMIN_PASSWORD) return false;
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}

export async function createSession(): Promise<string> {
  const sessionId = crypto.randomUUID();
  const expires = new Date(Date.now() + SESSION_DURATION);

  // Store session server-side
  activeSessions.set(sessionId, expires.getTime());

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires,
    path: '/',
  });

  return sessionId;
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);
  if (session?.value) {
    activeSessions.delete(session.value);
  }
  cookieStore.delete(SESSION_COOKIE);
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);
  if (!session?.value) return false;

  const expiresAt = activeSessions.get(session.value);
  if (!expiresAt || Date.now() > expiresAt) {
    // Session expired or unknown — clean up
    activeSessions.delete(session.value);
    return false;
  }

  return true;
}
