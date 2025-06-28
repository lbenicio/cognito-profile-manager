
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
    const sessionCookie = request.cookies.get('auth_session');
    const isPublicPage = publicPathnameRegex.test(request.nextUrl.pathname);

    // Helper to create a redirect response to the login page
    const redirectToLogin = (): NextResponse => {
        const loginUrl = new URL(pathnames['/login'], request.url);
        const response = NextResponse.redirect(loginUrl);
        
        const isProd = process.env.NODE_ENV === 'production';
        const appUrl = process.env.APP_URL?.replace(/\/$/, '');
        const cookieDomain = isProd && appUrl ? new URL(appUrl).hostname : undefined;

        response.cookies.set('auth_session', '', { 
            expires: new Date(0), 
            path: '/',
            domain: cookieDomain
        });
        response.cookies.set('oauth_state', '', { 
            expires: new Date(0), 
            path: '/',
            domain: cookieDomain
        });
        return response;
    };
    
    // --- Authentication Logic ---
    if (!sessionCookie) {
        if (!isPublicPage) {
            return redirectToLogin(); // Protected page, no session -> redirect now
        }
        // Public page, no session -> proceed to i18n
    } else {
        // Session cookie exists, validate it.
        let session;
        try {
            session = JSON.parse(sessionCookie.value);
        } catch {
            return redirectToLogin();
        }

        // Dev mode mock session
        if (session.username && !session.id_token) {
            if (isPublicPage) {
                return NextResponse.redirect(new URL(pathnames['/'], request.url));
            }
            // Dev user on protected page, proceed to i18n.
        } else if (!session.id_token || !session.refresh_token) {
            return redirectToLogin();
        } else {
            // It's a real OIDC session, validate JWT
            const wellknownUrl = process.env.NEXT_PUBLIC_COGNITO_WELLKNOWN;
            if (!wellknownUrl) {
                console.error('Middleware: Missing NEXT_PUBLIC_COGNITO_WELLKNOWN env var');
                return redirectToLogin();
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

                // Token is valid. If on a public page, redirect to home.
                if (isPublicPage) {
                    return NextResponse.redirect(new URL(pathnames['/'], request.url));
                }
            } catch (error: any) {
                if (error.code !== 'ERR_JWT_EXPIRED') {
                    console.error("Middleware JWT validation error:", error.message);
                    return redirectToLogin();
                }
                
                // Token is expired, try to refresh.
                const refreshed = await refreshAuthTokens(session.refresh_token);
                if (!refreshed) {
                    return redirectToLogin();
                }
                
                // Refresh succeeded. Let the request continue to its original destination,
                // but with the new session cookie set. This prevents a redirect loop.
                const response = NextResponse.next();
                
                const isProd = process.env.NODE_ENV === 'production';
                const appUrl = process.env.APP_URL?.replace(/\/$/, '');
                const cookieDomain = isProd && appUrl ? new URL(appUrl).hostname : undefined;
                
                response.cookies.set('auth_session', JSON.stringify(refreshed), {
                    httpOnly: true,
                    secure: isProd,
                    maxAge: 30 * 24 * 60 * 60, // 30 days
                    path: '/',
                    sameSite: isProd ? 'none' : 'lax',
                    domain: cookieDomain,
                });

                return response; // Return the response to continue the request
            }
        }
    }

    // --- I18n Logic ---
    return i18nMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
