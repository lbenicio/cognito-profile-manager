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

// New function to handle token refresh
async function refreshAccessToken(refreshToken: string) {
  try {
    const wellknownUrl = process.env.NEXT_PUBLIC_COGNITO_WELLKNOWN;
    if (!wellknownUrl) throw new Error('Missing NEXT_PUBLIC_COGNITO_WELLKNOWN env var');
    
    const wellknownResponse = await fetch(wellknownUrl, { cache: 'no-store' });
    if (!wellknownResponse.ok) throw new Error('Failed to fetch OpenID configuration');
    const wellknown = await wellknownResponse.json();
    const tokenEndpoint = wellknown.token_endpoint;

    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
      refresh_token: refreshToken,
    });

    const headers: HeadersInit = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };
    
    const clientSecret = process.env.COGNITO_CLIENT_SECRET;
    if (clientSecret) {
      headers['Authorization'] = `Basic ${Buffer.from(
        `${process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!}:${clientSecret}`
      ).toString('base64')}`;
    }

    const tokenResponse = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: headers,
      body: params.toString(),
      cache: 'no-store',
    });

    const tokens = await tokenResponse.json();
    if (!tokenResponse.ok) {
      console.error("Failed to refresh tokens:", tokens);
      throw new Error('Could not refresh token');
    }

    // Cognito refresh response doesn't include a new refresh token unless configured to do so.
    // We will reuse the old one, but get new access and id tokens.
    const newSessionData = {
      id_token: tokens.id_token,
      access_token: tokens.access_token,
      refresh_token: refreshToken, // Re-use the existing refresh token
      expires_at: Date.now() + (tokens.expires_in * 1000),
    };
    
    return newSessionData;
  } catch (error) {
    console.error('Token refresh error:', error);
    return null;
  }
}

// Helper function to avoid repetition
function redirectToLogin(request: NextRequest, sessionCookie?: any): NextResponse {
    const loginUrl = new URL(pathnames['/login'], request.url);
    const response = NextResponse.redirect(loginUrl);
    
    if (sessionCookie) {
      const hostname = request.nextUrl.hostname;
      const domain = hostname === 'localhost' ? undefined : hostname;
      response.cookies.set('auth_session', '', { expires: new Date(0), path: '/', domain });
    }
    return response;
}

export async function authMiddleware(request: NextRequest): Promise<NextResponse | null> {
  const sessionCookie = request.cookies.get('auth_session');
  const pathname = request.nextUrl.pathname;
  let session;

  try {
    session = sessionCookie ? JSON.parse(sessionCookie.value) : null;
  } catch {
    session = null;
  }

  const isPublicPage = publicPages.includes(pathname as (typeof publicPages)[number]);
  
  const hostname = request.nextUrl.hostname;
  const domain = hostname === 'localhost' ? undefined : hostname;

  // Handle mock dev session
  if (process.env.NODE_ENV === 'development' && session?.username && !session.id_token) {
    if (isPublicPage) {
      return NextResponse.redirect(new URL(pathnames['/'], request.url));
    }
    return null; // Valid dev session on protected page
  }
  
  // If no session and trying to access a protected page, redirect to login
  if (!session && !isPublicPage) {
    return redirectToLogin(request, sessionCookie);
  }
  
  // If there is a session, check its validity
  if (session) {
    const isExpired = session.expires_at ? Date.now() > session.expires_at : true;

    if (isExpired) {
      if (session.refresh_token) {
        const newSession = await refreshAccessToken(session.refresh_token);
        if (newSession) {
          // Token refreshed successfully. Let the request continue but set the new cookie.
          const response = isPublicPage 
            ? NextResponse.redirect(new URL(pathnames['/'], request.url))
            : NextResponse.next();
            
          response.cookies.set('auth_session', JSON.stringify(newSession), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 30 * 24 * 60 * 60,
            path: '/',
            sameSite: 'lax',
            domain: domain,
          });
          return response;
        } else {
          // Refresh failed, log the user out
          return redirectToLogin(request, sessionCookie);
        }
      } else {
        // Expired and no refresh token, log out
        return redirectToLogin(request, sessionCookie);
      }
    } else {
      // Session is not expired.
      // We still do a quick verification of the token to ensure it wasn't revoked.
      const isTokenValid = await verifyToken(session.id_token);
      if (!isTokenValid) {
        return redirectToLogin(request, sessionCookie);
      }

      // Valid session, if on a public page, redirect to dashboard.
      if (isPublicPage) {
        return NextResponse.redirect(new URL(pathnames['/'], request.url));
      }
    }
  }
  
  // By default, let the request pass through
  return null;
}
