import { NextRequest, NextResponse } from 'next/server';
import { jwtDecrypt } from 'jose';
import { pathnames, locales } from '@/navigation';
import { Logger } from '@/lib/logger';

const logger = new Logger('MIDDLEWARE-AUTH');

// List of public pages that do not require authentication
const publicPages = ['/login', '/terms', '/privacy'];

/**
 * Checks if the given pathname is a public page, considering locales.
 */
function isPublicPage(pathname: string): boolean {
  // Matches /login, /en/login, /es/terms, etc.
  const publicPathnameRegex = RegExp(
    `^(/(${locales.join('|')}))?(${publicPages.join('|')})/?$`,
    'i'
  );
  return publicPathnameRegex.test(pathname);
}

// Minimal, Edge-compatible session payload check
async function getSessionPayload(cookie: string | undefined) {
  if (!cookie) return null;

  try {
    const secretKey = process.env.TOTP_SECRET_ENCRYPTION_KEY;
    if (!secretKey) {
      logger.error('TOTP_SECRET_ENCRYPTION_KEY is not set for middleware.');
      return null;
    }
    const encodedKey = Buffer.from(secretKey, 'base64');
    const { payload } = await jwtDecrypt(cookie, encodedKey, {
      clockTolerance: '15s',
    });
    return payload;
  } catch (error) {
    // This will catch expired tokens, invalid tokens, etc.
    return null;
  }
}

/**
 * Authentication middleware.
 * - Redirects unauthenticated users from protected pages to login.
 * - Redirects authenticated users from public pages to dashboard.
 * - Returns null if no redirect is needed.
 */
export async function authMiddleware(
  request: NextRequest
): Promise<NextResponse | null> {
  const isPublic = isPublicPage(request.nextUrl.pathname);
  const sessionCookie = request.cookies.get('session')?.value;
  const sessionPayload = await getSessionPayload(sessionCookie);
  const isAuthenticated = !!sessionPayload;

  // If not authenticated and trying to access a protected page...
  if (!isAuthenticated && !isPublic) {
    const loginUrl = new URL(pathnames['/login'], request.url);
    // Clear any potentially invalid cookie
    const response = NextResponse.redirect(loginUrl);
    response.cookies.set('session', '', { expires: new Date(0), path: '/' });
    return response;
  }

  // If authenticated and on a public page (like /login)...
  if (isAuthenticated && isPublic) {
    const dashboardUrl = new URL(pathnames['/'], request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // If authentication checks pass, allow the request to proceed.
  return null;
}
