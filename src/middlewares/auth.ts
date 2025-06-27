
import { NextRequest, NextResponse } from 'next/server';
import { pathnames, locales } from '@/navigation';
import { jwtVerify, createRemoteJWKSet } from 'jose';
import { refreshAuthTokens } from '@/lib/session-actions';

// All pages that are public and don't require authentication
const publicPages = [
    pathnames['/login'],
    pathnames['/terms'],
    pathnames['/privacy']
]; 

// Simplified regex now that we know localePrefix is 'never'
const publicPathnameRegex = new RegExp(`^(${publicPages.join('|')})/?$`, 'i');


// Helper function to redirect to the login page and clear auth cookies
function redirectToLogin(request: NextRequest): NextResponse {
    const loginUrl = new URL(pathnames['/login'], request.url);
    const response = NextResponse.redirect(loginUrl);
    
    // Clear both session and state cookies on redirect to prevent issues.
    response.cookies.set('auth_session', '', { expires: new Date(0), path: '/' });
    response.cookies.set('oauth_state', '', { expires: new Date(0), path: '/' });

    return response;
}

export async function authMiddleware(request: NextRequest): Promise<NextResponse | null> {
    const sessionCookie = request.cookies.get('auth_session');
    const isPublicPage = publicPathnameRegex.test(request.nextUrl.pathname);

    // If no cookie, redirect protected pages to login
    if (!sessionCookie) {
        if (!isPublicPage) {
            return redirectToLogin(request);
        }
        return null;
    }

    // If there is a cookie, parse it.
    let session;
    try {
        session = JSON.parse(sessionCookie.value);
    } catch {
        return redirectToLogin(request);
    }
    
    // Handle dev-only mock session
    if (session.username && !session.id_token) {
        if (isPublicPage) {
            return NextResponse.redirect(new URL(pathnames['/'], request.url));
        }
        return null; // Dev user is on a protected page, allow.
    }

    // --- Main OIDC Session Validation & Refresh Logic ---
    if (!session.id_token || !session.refresh_token) {
        return redirectToLogin(request);
    }

    const wellknownUrl = process.env.NEXT_PUBLIC_COGNITO_WELLKNOWN;
    if (!wellknownUrl) {
      console.error('Middleware: Missing NEXT_PUBLIC_COGNITO_WELLKNOWN env var');
      return redirectToLogin(request);
    }

    try {
        const wellknownResponse = await fetch(wellknownUrl, { cache: 'no-store' });
        if (!wellknownResponse.ok) throw new Error('Failed to fetch OpenID configuration');
        const wellknown = await wellknownResponse.json();
        const JWKS = createRemoteJWKSet(new URL(wellknown.jwks_uri));
        await jwtVerify(session.id_token, JWKS, {
            issuer: wellknown.issuer,
            audience: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
        });

        // Token is valid. If user is on a public page, redirect to dashboard.
        if (isPublicPage) {
            return NextResponse.redirect(new URL(pathnames['/'], request.url));
        }
        // Otherwise, allow access by returning null.
        return null;

    } catch (error: any) {
        if (error.code !== 'ERR_JWT_EXPIRED') {
            // Some other JWT error (e.g., invalid signature), treat as invalid session.
            console.error("Middleware JWT validation error:", error.message);
            return redirectToLogin(request);
        }
        
        // Token is expired, try to refresh.
        const newSession = await refreshAuthTokens(session.refresh_token);

        if (!newSession) {
            // Refresh failed, user must log in again.
            return redirectToLogin(request);
        }

        // Refresh successful. Create a response to set the new cookie.
        const response = isPublicPage 
            ? NextResponse.redirect(new URL(pathnames['/'], request.url))
            : NextResponse.next();

        const isProd = process.env.NODE_ENV === 'production';
        response.cookies.set('auth_session', JSON.stringify(newSession), {
            httpOnly: true,
            secure: isProd,
            maxAge: 30 * 24 * 60 * 60, // 30 days
            path: '/',
            sameSite: isProd ? 'none' : 'lax',
        });
        
        return response; // Continue to originally requested page (or redirect) with new cookie.
    }
}
