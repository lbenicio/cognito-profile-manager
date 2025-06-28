import { NextRequest, NextResponse } from 'next/server';
import createI18nMiddleware from 'next-intl/middleware';
import { pathnames, locales, localePrefix } from '@/navigation';
import { refreshAuthTokens } from '@/lib/session-actions';
import { decrypt, encrypt } from '@/lib/session';

const publicPages = ['/login', '/terms', '/privacy'];
const publicPathnameRegex = new RegExp(`^(/(${locales.join('|')}))?(${publicPages.join('|')})/?$`, 'i');

const i18nMiddleware = createI18nMiddleware({
  locales,
  localePrefix,
  pathnames,
  defaultLocale: 'en',
});

async function handleSession(request: NextRequest) {
  const sessionCookie = request.cookies.get('session')?.value;
  let session = await decrypt(sessionCookie);
  
  const isPublicPage = publicPathnameRegex.test(request.nextUrl.pathname);

  // If there's no session and the user is on a protected page, redirect to login
  if (!session && !isPublicPage) {
    const loginUrl = new URL(pathnames['/login'], request.url);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.set('session', '', { expires: new Date(0), path: '/' });
    return response;
  }
  
  // If there is a session and the user is on a public page, redirect to the dashboard
  if (session && isPublicPage) {
    const dashboardUrl = new URL(pathnames['/'], request.url);
    return NextResponse.redirect(dashboardUrl);
  }
  
  // If the session's access token is expired, try to refresh it
  if (session && session.exp * 1000 < Date.now()) {
    try {
      const refreshResult = await refreshAuthTokens(session.refreshToken);
      if (refreshResult) {
        const { newClaims, newAccessToken, newRefreshToken, newExpiresIn } = refreshResult;
        
        // Prepare the new session payload
        const newSessionPayload = {
          claims: newClaims,
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          iat: Date.now() / 1000,
          exp: (Date.now() / 1000) + newExpiresIn,
        };
        const encryptedSession = await encrypt(newSessionPayload);
        
        // Let the i18n middleware handle the original request path
        const response = i18nMiddleware(request);

        // Set the new session cookie on the response
        const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7-day cookie
        response.cookies.set('session', encryptedSession, {
          expires,
          httpOnly: true,
          secure: true,
          path: '/',
          sameSite: 'lax',
        });
        
        return response;
      } else {
        // Refresh failed, clear the session and redirect to login
        const loginUrl = new URL(pathnames['/login'], request.url);
        const response = NextResponse.redirect(loginUrl);
        response.cookies.set('session', '', { expires: new Date(0), path: '/' });
        return response;
      }
    } catch(e) {
      console.error("Middleware refresh token error:", e);
      // Redirect to login on error
      const loginUrl = new URL(pathnames['/login'], request.url);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.set('session', '', { expires: new Date(0), path: '/' });
      return response;
    }
  }

  // If the session is valid, just proceed with i18n
  return i18nMiddleware(request);
}

export async function middleware(request: NextRequest) {
  return handleSession(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
