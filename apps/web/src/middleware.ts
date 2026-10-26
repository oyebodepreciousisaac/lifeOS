import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'schoolos_session';
const SESSION_SECRET =
  process.env.SESSION_SECRET || 'dev_secret_key_at_least_32_characters_long_for_hmac_signature';

/**
 * Validates session token payload and expiry in Next.js Edge Middleware.
 */
function parseAndValidateSession(token: string): { valid: boolean; isPrivileged?: boolean; mfaVerified?: boolean } {
  try {
    if (!token || !token.includes('.')) return { valid: false };

    const [data] = token.split('.');
    if (!data) return { valid: false };

    const decodedStr = Buffer.from(data, 'base64url').toString('utf-8');
    const payload = JSON.parse(decodedStr);

    if (!payload.expiresAt || Date.now() > payload.expiresAt) {
      return { valid: false };
    }

    return {
      valid: true,
      isPrivileged: Boolean(payload.isPrivileged),
      mfaVerified: Boolean(payload.mfaVerified),
    };
  } catch {
    return { valid: false };
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = sessionCookie ? parseAndValidateSession(sessionCookie) : { valid: false };

  // Protected route paths
  const isProtectedRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/portal') ||
    pathname.startsWith('/setup');

  if (isProtectedRoute) {
    if (!session.valid) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Privileged role with pending MFA verification
    if (session.isPrivileged && !session.mfaVerified && pathname !== '/mfa-challenge') {
      return NextResponse.redirect(new URL('/mfa-challenge', request.url));
    }
  }

  // If already fully authenticated and visiting login or mfa-challenge, redirect to dashboard
  if (session.valid && (pathname === '/login' || (pathname === '/mfa-challenge' && session.mfaVerified))) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/dashboard',
    '/admin/:path*',
    '/admin',
    '/portal/:path*',
    '/portal',
    '/setup/:path*',
    '/setup',
    '/login',
    '/mfa-challenge',
  ],
};
