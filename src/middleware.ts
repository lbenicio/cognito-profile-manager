
import { NextRequest, NextResponse } from 'next/server';
import createI18nMiddleware from 'next-intl/middleware';
import { pathnames, locales, localePrefix } from '@/navigation';
import { jwtVerify, createRemoteJWKSet } from 'jose';
import { refreshAuthTokens, type NewSessionData } from '@/lib/session-actions';

const publicPages = ['/login', '/terms', '/privacy'];
const publicPathnameRegex = new RegExp(`^(/(${locales.join('|')}))?(${publicPages.join('|')})/?$`, 'i');

const i18nMiddleware = createI18nMiddleware({
  locales,
  localePrefix,
  pathnames,
  defaultLocale: 'en',
});

// Helper function to check and refresh the session
async function checkAndRefreshSession(request: NextRequest): Promise<{ isValid: boolean, newCookie?: { name: string, value: string, options: any } }> {
    const sessionCookie = request.cookies.get('auth_session');
    if (!sessionCookie) return { isValid: false };

    let session;
    try {
        session = JSON.parse(sessionCookie.value);
    } catch {
        return { isValid: false }; // Invalid cookie format
    }

    if (session.username && !session.id_token && process.env.NODE_ENV === 'development') {
        return { isValid: true }; // Dev mode mock session
    }

    if (!session.id_token || !session.refresh_token) {
        return { isValid: false };
    }

    const wellknownUrl = process.env.NEXT_PUBLIC_COGNITO_WELLKNOWN;
    if (!wellknownUrl) {
        console.error('Missing NEXT_PUBLIC_COGNITO_WELLKNOWN env var');
        return { isValid: false };
    }
    
    try {
        const wellknownResponse = await fetch(wellknownUrl, { cache: 'no-store' });
        if (!wellknownResponse.ok) throw new Error('Failed to fetch OpenID configuration');
        const wellknown = await wellknownResponse.json();
        const JWKS = createRemoteJWKSet(new URL(wellknown.jwks_uri));
        
        await jwtVerify(session.id_token, JWKS, {
            issuer: wellknown.issuer,
            audience: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
            clockTolerance: '10 seconds', // Add tolerance for clock skew
        });
        
        return { isValid: true }; // Token is valid

    } catch (error: any) {
        if (error.code === 'ERR_JWT_EXPIRED') {
            const newSessionData = await refreshAuthTokens(session.refresh_token);
            if (newSessionData) {
                const isProd = process.env.NODE_ENV === 'production';
                const appUrl = process.env.APP_URL?.replace(/\/$/, '');
                let cookieDomain: string | undefined;
                if (isProd && appUrl) {
                    const hostname = new URL(appUrl).hostname;
                    cookieDomain = hostname.startsWith('www.') ? hostname.substring(4) : hostname;
                }
                
                const maxAge = newSessionData.expires_in ?? 3600;

                return {
                    isValid: true,
                    newCookie: {
                        name: 'auth_session',
                        value: JSON.stringify(newSessionData),
                        options: {
                            httpOnly: true,
                            secure: isProd,
                            maxAge: maxAge,
                            path: '/',
                            sameSite: isProd ? 'none' : 'lax',
                            domain: cookieDomain,
                        }
                    }
                };
            }
        } else {
            console.error("Middleware JWT validation error:", error.message);
        }
        
        return { isValid: false }; // Refresh failed or other JWT error
    }
}

// The main middleware function
export async function middleware(request: NextRequest) {
    const { isValid, newCookie } = await checkAndRefreshSession(request);
    const isPublicPage = publicPathnameRegex.test(request.nextUrl.pathname);

    let response: NextResponse;

    if (isValid && isPublicPage) {
        // Logged-in user on a public page, redirect to dashboard
        const dashboardUrl = new URL(pathnames['/'], request.url);
        response = NextResponse.redirect(dashboardUrl);
    } else if (!isValid && !isPublicPage) {
        // Not logged-in on a protected page, redirect to login
        const loginUrl = new URL(pathnames['/login'], request.url);
        response = NextResponse.redirect(loginUrl);
        // Clear any potentially invalid cookies on the way out
        response.cookies.set('auth_session', '', { expires: new Date(0), path: '/' });
    } else {
        // No auth redirect needed, proceed with i18n
        response = i18nMiddleware(request);
    }

    // Attach new cookie if a refresh happened
    if (newCookie) {
        response.cookies.set(newCookie.name, newCookie.value, newCookie.options);
    }

    return response;
}

export const config = {
  // Skip all paths that should not be internationalized. This example skips the
  // folders "api", "_next" and all files with an extension (e.g. favicon.ico)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
