import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import crypto from 'crypto';
import { AuthSession, isPrivilegedRole } from './rbac';

const SESSION_COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'schoolos_session';
const SESSION_SECRET =
  process.env.SESSION_SECRET || 'dev_secret_key_at_least_32_characters_long_for_hmac_signature';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8; // 8 hours absolute expiration

/**
 * Signs and encodes a session payload using HMAC-SHA256.
 * Output: `base64(payload).signature`
 */
export function signSessionPayload(payload: AuthSession): string {
  const jsonStr = JSON.stringify(payload);
  const data = Buffer.from(jsonStr).toString('base64url');
  const hmac = crypto.createHmac('sha256', SESSION_SECRET);
  hmac.update(data);
  const signature = hmac.digest('base64url');
  return `${data}.${signature}`;
}

/**
 * Decodes and cryptographically verifies a signed session token.
 */
export function verifySessionToken(token: string): AuthSession | null {
  if (!token || !token.includes('.')) return null;

  const [data, signature] = token.split('.');
  if (!data || !signature) return null;

  const hmac = crypto.createHmac('sha256', SESSION_SECRET);
  hmac.update(data);
  const expectedSignature = hmac.digest('base64url');

  try {
    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
    if (!isValid) return null;

    const payload: AuthSession = JSON.parse(
      Buffer.from(data, 'base64url').toString('utf-8')
    );

    // Check expiration timestamp
    if (Date.now() > payload.expiresAt) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Creates and sets an encrypted HTTP-only session cookie.
 */
export async function createSession(
  sessionData: Omit<AuthSession, 'expiresAt' | 'isPrivileged'>
): Promise<AuthSession> {
  const isPrivileged = isPrivilegedRole(sessionData.userType);
  const session: AuthSession = {
    ...sessionData,
    isPrivileged,
    expiresAt: Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
  };

  const token = signSessionPayload(session);
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: '/',
  });

  return session;
}

/**
 * Extracts and verifies the current session from incoming HTTP cookies.
 */
export async function getSession(): Promise<AuthSession | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(SESSION_COOKIE_NAME);
  if (!cookie?.value) return null;
  return verifySessionToken(cookie.value);
}

/**
 * Clears the session cookie on user logout.
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Server guard: Ensures user is authenticated. Returns session or throws.
 */
export async function requireAuth(): Promise<AuthSession> {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  // If role is privileged but MFA has not been completed, restrict access
  if (session.isPrivileged && !session.mfaVerified) {
    redirect('/mfa-challenge');
  }

  return session;
}

/**
 * Server guard: Resolves school tenant scope strictly from verified session.
 * Never trusts client headers or query parameters alone!
 */
export async function requireTenant(): Promise<string> {
  const session = await requireAuth();
  if (!session.schoolId) {
    throw new Error('403 Forbidden: Session does not belong to a valid school tenant.');
  }
  return session.schoolId;
}
