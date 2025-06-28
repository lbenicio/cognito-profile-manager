
import { NextRequest, NextResponse } from 'next/server';
import createI18nMiddleware from 'next-intl/middleware';
import { pathnames, locales, localePrefix } from '@/navigation';
import { jwtVerify, createRemoteJWKSet } from 'jose';
import { refreshAuthTokens } from '@/lib/session-actions';

// Define public pages
const publicPages = [
    pathnames['/login'],
    pathnames['/terms'],
    pathnames['/privacy']
]; 
const publicPathnameRegex = new RegExp(`^(${publicPages.join('|')})/?$`, 'i');

// Create the i18n middleware instance
const i18nMiddleware = createI18nMiddleware({
  locales,
  localePrefix,
  pathnames,
  defaultLocale: 'en',
});

// The main middleware function
export async function middleware(request: NextRequest) {
    let sessionIsValid = false;
    let newSessionCookieValue: string | null = null;

    // Helper to create a redirect response to the login page, clearing cookies.
    const redirectToLogin = (): NextResponse => {
        const loginUrl = new URL(pathnames['/login'], request.url);
        const response = NextResponse.redirect(loginUrl);
        
        const isProd = process.env.NODE_ENV === 'production';
        const appUrl = process.env.APP_URL?.replace(/\/$/, '');
        const cookieDomain = isProd && appUrl ? new URL(appUrl).hostname : undefined;

        response.cookies.set('auth_session', '', { expires: new Date(0), path: '/', domain: cookieDomain });
        response.cookies.set('oauth_state', '', { expires: new Date(0), path: '/', domain: cookieDomain });
        return response;
    };
    
    // --- 1. Determine Session Validity ---
    const sessionCookie = request.cookies.get('auth_session');
    if (sessionCookie) {
        let session;
        try {
            session = JSON.parse(sessionCookie.value);
        } catch {
            // Invalid cookie format, treat as no session
        }

        if (session) {
            // Handle dev mode mock session
            if (session.username && !session.id_token) {
                 sessionIsValid = true;
            } 
            // Handle real OIDC session
            else if (session.id_token && session.refresh_token) {
                 const wellknownUrl = process.env.NEXT_PUBLIC_COGNITO_WELLKNOWN;
                 if (wellknownUrl) {
                    try {
                        const wellknownResponse = await fetch(wellknownUrl, { cache: 'no-store' });
                        if (!wellknownResponse.ok) throw new Error('Failed to fetch OpenID configuration');
                        const wellknown = await wellknownResponse.json();
                        const JWKS = createRemoteJWKSet(new URL(wellknown.jwks_uri));
                        
                        await jwtVerify(session.id_token, JWKS, {
                            issuer: wellknown.issuer,
                            audience: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
                        });
                        sessionIsValid = true;

                    } catch (error: any) {
                        if (error.code === 'ERR_JWT_EXPIRED') {
                            const refreshedSession = await refreshAuthTokens(session.refresh_token);
                            if (refreshedSession) {
                                newSessionCookieValue = JSON.stringify(refreshedSession);
                                sessionIsValid = true; // Session is now valid for this request
                            }
                        } else {
                            console.error("Middleware JWT validation error:", error.message);
                        }
                    }
                 }
            }
        }
    }

    // --- 2. Apply Routing Rules ---
    const isPublicPage = publicPathnameRegex.test(request.nextUrl.pathname);

    if (sessionIsValid) {
        if (isPublicPage) {
            // Logged-in user on a public page (like /login), redirect to dashboard
            const dashboardResponse = NextResponse.redirect(new URL(pathnames['/'], request.url));
             if (newSessionCookieValue) {
                const isProd = process.env.NODE_ENV === 'production';
                const appUrl = process.env.APP_URL?.replace(/\/$/, '');
                const cookieDomain = isProd && appUrl ? new URL(appUrl).hostname : undefined;
                const newSession = JSON.parse(newSessionCookieValue);
                const maxAge = newSession.expires_in && typeof newSession.expires_in === 'number' 
                    ? newSession.expires_in 
                    : 3600;
                
                dashboardResponse.cookies.set('auth_session', newSessionCookieValue, {
                    httpOnly: true, secure: isProd, maxAge: maxAge, path: '/', sameSite: isProd ? 'none' : 'lax', domain: cookieDomain,
                });
            }
            return dashboardResponse;
        }
    } else {
        if (!isPublicPage) {
            // Not logged-in and on a protected page, redirect to login
            return redirectToLogin();
        }
    }

    // --- 3. Pass to i18n Middleware ---
    const response = i18nMiddleware(request);

    // --- 4. Attach New Cookie if Refreshed ---
    if (newSessionCookieValue) {
        const isProd = process.env.NODE_ENV === 'production';
        const appUrl = process.env.APP_URL?.replace(/\/$/, '');
        const cookieDomain = isProd && appUrl ? new URL(appUrl).hostname : undefined;
        
        const newSession = JSON.parse(newSessionCookieValue);
        const maxAge = newSession.expires_in && typeof newSession.expires_in === 'number' 
            ? newSession.expires_in 
            : 3600;
        
        response.cookies.set('auth_session', newSessionCookieValue, {
            httpOnly: true,
            secure: isProd,
            maxAge: maxAge,
            path: '/',
            sameSite: isProd ? 'none' : 'lax',
            domain: cookieDomain,
        });
    }
    
    return response;
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
