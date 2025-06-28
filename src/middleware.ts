
import { NextRequest, NextResponse } from 'next/server';
import createI18nMiddleware from 'next-intl/middleware';
import { pathnames, locales, localePrefix } from '@/navigation';
import { refreshAuthTokens } from '@/lib/session-actions';
import type { JWTPayload } from 'jose';

const publicPages = ['/login', '/terms', '/privacy'];
const publicPathnameRegex = new RegExp(`^(/(${locales.join('|')}))?(${publicPages.join('|')})/?$`, 'i');

const i18nMiddleware = createI18nMiddleware({
  locales,
  localePrefix,
  pathnames,
  defaultLocale: 'en',
});

type NewCookie = { name: string; value: string; options: any };

// Helper function to check and refresh the session
async function checkAndRefreshSession(request: NextRequest): Promise<{ isValid: boolean, newCookies?: NewCookie[] }> {
    // Check for dev mode mock session first.
    const mockSessionCookie = request.cookies.get('auth_session');
    if (mockSessionCookie) {
        try {
            const session = JSON.parse(mockSessionCookie.value);
            if (session.username && process.env.NODE_ENV === 'development') {
                return { isValid: true };
            }
        } catch { /* Invalid JSON, ignore */ }
    }

    // For a real session, we need all three cookies.
    const claimsCookie = request.cookies.get('id_token_claims');
    const accessTokenCookie = request.cookies.get('access_token');
    const refreshTokenCookie = request.cookies.get('refresh_token');

    if (!claimsCookie?.value || !accessTokenCookie?.value || !refreshTokenCookie?.value) {
        return { isValid: false };
    }

    let claims: JWTPayload;
    try {
        claims = JSON.parse(claimsCookie.value);
    } catch {
        return { isValid: false }; // Invalid claims format
    }
    
    // Check if the token is expired.
    const isExpired = claims.exp! * 1000 < Date.now();
    
    if (!isExpired) {
      return { isValid: true };
    }

    // Token is expired, try to refresh it.
    try {
        const refreshResult = await refreshAuthTokens(refreshTokenCookie.value);
        if (refreshResult) {
            const { newClaims, newAccessToken, newRefreshToken, newExpiresIn } = refreshResult;
            const isSecure = new URL(request.url).protocol === 'https:';
            const cookieOptions = {
                httpOnly: true,
                secure: isSecure,
                maxAge: newExpiresIn,
                path: '/',
                sameSite: 'lax' as const,
            };

            const newCookies: NewCookie[] = [
                { name: 'id_token_claims', value: JSON.stringify(newClaims), options: cookieOptions },
                { name: 'access_token', value: newAccessToken, options: cookieOptions },
                { name: 'refresh_token', value: newRefreshToken, options: cookieOptions },
            ];

            return { isValid: true, newCookies };
        }
    } catch(error) {
        console.error("Middleware token refresh failed:", error);
    }
        
    // If refresh fails, the session is invalid.
    return { isValid: false };
}

// The main middleware function
export async function middleware(request: NextRequest) {
    const { isValid, newCookies } = await checkAndRefreshSession(request);
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
        const cookieClearOptions = { expires: new Date(0), path: '/' };
        response.cookies.set('auth_session', '', cookieClearOptions);
        response.cookies.set('id_token_claims', '', cookieClearOptions);
        response.cookies.set('access_token', '', cookieClearOptions);
        response.cookies.set('refresh_token', '', cookieClearOptions);
    } else {
        // No auth redirect needed, proceed with i18n
        response = i18nMiddleware(request);
    }

    // Attach new cookies if a refresh happened
    if (newCookies) {
        newCookies.forEach(cookie => {
            response.cookies.set(cookie.name, cookie.value, cookie.options);
        });
    }

    return response;
}

export const config = {
  // Skip all paths that should not be internationalized. This example skips the
  // folders "api", "_next" and all files with an extension (e.g. favicon.ico)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
