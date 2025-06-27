import { NextRequest, NextResponse } from 'next/server';
import { pathnames } from '@/navigation';
import { jwtVerify, createRemoteJWKSet } from 'jose';

// All pages that are public and don't require authentication
const publicPages = [pathnames['/login']]; 

// This function is for verifying the JWT
async function verifyToken(token: string): Promise<boolean> {
  if (!token) return false;

  try {
    const wellknownUrl = process.env.NEXT_PUBLIC_COGNITO_WELLKNOWN;
    if (!wellknownUrl) {
        console.error('Missing NEXT_PUBLIC_COGNITO_WELLKNOWN env var in middleware.');
        return false;
    };
    
    // Construct issuer and JWKS URI from the wellknown URL for efficiency in middleware
    const issuer = wellknownUrl.replace('/.well-known/openid-configuration', '');
    const jwksUri = new URL('.well-known/jwks.json', issuer);

    const JWKS = createRemoteJWKSet(jwksUri);

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

export async function authMiddleware(request: NextRequest): Promise<NextResponse | null> {
  const sessionCookie = request.cookies.get('auth_session');
  const pathname = request.nextUrl.pathname;
  let isSessionValid = false;

  if (sessionCookie?.value) {
    try {
      const session = JSON.parse(sessionCookie.value);
      if (session.id_token) {
        isSessionValid = await verifyToken(session.id_token);
      } else if (process.env.NODE_ENV === 'development' && session.username) {
        // Handle dev mock session
        isSessionValid = true;
      }
    } catch (e) {
      // Malformed cookie, treat as invalid
      isSessionValid = false;
    }
  }

  const isPublicPage = publicPages.includes(pathname as (typeof publicPages)[number]);

  // If the session is valid and user tries to access a public page (like /login),
  // redirect them to the dashboard.
  if (isSessionValid && isPublicPage) {
    return NextResponse.redirect(new URL(pathnames['/'], request.url));
  }

  // If the session is not valid and the user tries to access a protected page,
  // redirect them to the login page and clear the invalid cookie.
  if (!isSessionValid && !isPublicPage) {
    const loginUrl = new URL(pathnames['/login'], request.url);
    const response = NextResponse.redirect(loginUrl);
    
    if (sessionCookie) {
      response.cookies.set('auth_session', '', { expires: new Date(0), path: '/' });
    }
    return response;
  }
  
  // If no redirect is needed (e.g., valid session on protected page, or no session on public page),
  // pass to the next middleware.
  return null;
}
