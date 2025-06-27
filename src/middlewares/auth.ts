
import { NextRequest, NextResponse } from 'next/server';
import { pathnames, locales } from '@/navigation';
import { jwtVerify, createRemoteJWKSet } from 'jose';

// All pages that are public and don't require authentication
const publicPages = [pathnames['/login']]; 
const publicPathnameRegex = new RegExp(
  `^(/(${locales.join('|')}))?(${publicPages.join('|')})/?$`,
  'i'
);


// This function is for verifying the JWT
async function verifyToken(token: string): Promise<boolean> {
  if (!token) return false;

  try {
    const wellknownUrl = process.env.NEXT_PUBLIC_COGNITO_WELLKNOWN;
    if (!wellknownUrl) {
        console.error('Missing NEXT_PUBLIC_COGNITO_WELLKNOWN env var in middleware.');
        return false;
    };
    
    const wellknownResponse = await fetch(wellknownUrl, { cache: 'no-store' });
    if (!wellknownResponse.ok) {
        console.error('Failed to fetch OpenID configuration in middleware.');
        return false;
    }
    const wellknown = await wellknownResponse.json();

    const jwksUri = wellknown.jwks_uri;
    const issuer = wellknown.issuer;
    
    if (!jwksUri || !issuer) {
        console.error('JWKS URI or Issuer missing from OpenID configuration.');
        return false;
    }

    const JWKS = createRemoteJWKSet(new URL(jwksUri));

    await jwtVerify(token, JWKS, {
      issuer: issuer,
      audience: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
    });

    return true; // Token is valid
  } catch (error) {
    // Errors like token expiration are expected, so no need to log them every time.
    return false; // Token is invalid
  }
}

// Helper function to avoid repetition
function redirectToLogin(request: NextRequest): NextResponse {
    const loginUrl = new URL(pathnames['/login'], request.url);
    const response = NextResponse.redirect(loginUrl);
    
    // Clear both session and state cookies on redirect.
    response.cookies.set('auth_session', '', { expires: new Date(0), path: '/' });
    response.cookies.set('oauth_state', '', { expires: new Date(0), path: '/' });

    return response;
}

export async function authMiddleware(request: NextRequest): Promise<NextResponse | null> {
  const sessionCookie = request.cookies.get('auth_session');
  let session;

  try {
    session = sessionCookie ? JSON.parse(sessionCookie.value) : null;
  } catch {
    session = null;
  }

  const isPublicPage = publicPathnameRegex.test(request.nextUrl.pathname);

  // Handle mock dev session
  if (process.env.NODE_ENV === 'development' && session?.username && !session.id_token) {
    if (isPublicPage) {
      return NextResponse.redirect(new URL(pathnames['/'], request.url));
    }
    return null; // Valid dev session on protected page
  }
  
  const hasIdToken = session?.id_token;

  if (!hasIdToken) {
    // No session token, if on a protected page, redirect to login
    if (!isPublicPage) {
      return redirectToLogin(request);
    }
    // If on a public page, allow access
    return null;
  }

  // Has a session token, let's verify it
  const isTokenValid = await verifyToken(session.id_token);

  if (!isTokenValid) {
    // Token is invalid (e.g., expired, revoked), redirect to login and clear cookies
    return redirectToLogin(request);
  }

  // Token is valid. If user is trying to access a public page (like /login),
  // redirect them to the dashboard.
  if (isPublicPage) {
    return NextResponse.redirect(new URL(pathnames['/'], request.url));
  }
  
  // By default, let the request pass through for valid sessions on protected pages
  return null;
}
