
import { NextRequest, NextResponse } from 'next/server';
import createI18nMiddleware from 'next-intl/middleware';
import { pathnames, locales, localePrefix } from '@/navigation';
import { refreshAuthTokens } from '@/lib/session-actions';
import type { Session } from './lib/auth';

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

    let session: Session;
    try {
        session = JSON.parse(sessionCookie.value);
    } catch {
        return { isValid: false }; // Invalid cookie format
    }

    if (session?.username && process.env.NODE_ENV === 'development') {
        return { isValid: true }; // Dev mode mock session
    }

    // A real session must have claims, accessToken, and refreshToken.
    if (!session?.claims || !session.accessToken || !session.refreshToken) {
        return { isValid: false };
    }
    
    // Check if the token is expired.
    const isExpired = session.claims.exp! * 1000 < Date.now();
    
    if (!isExpired) {
      return { isValid: true };
    }

    // Token is expired, try to refresh it.
    try {
        const refreshResult = await refreshAuthTokens(session.refreshToken);
        if (refreshResult) {
            const { newSession, newExpiresIn } = refreshResult;
            const isSecure = new URL(request.url).protocol === 'https:';

            return {
                isValid: true,
                newCookie: {
                    name: 'auth_session',
                    value: JSON.stringify(newSession),
                    options: {
                        httpOnly: true,
                        secure: isSecure,
                        maxAge: newExpiresIn,
                        path: '/',
                        sameSite: 'lax',
                    }
                }
            };
        }
    } catch(error) {
        console.error("Middleware token refresh failed:", error);
    }
        
    // If refresh fails, the session is invalid.
    return { isValid: false };
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
