
import { NextRequest, NextResponse } from 'next/server';
import createI18nMiddleware from 'next-intl/middleware';
import { pathnames, locales, localePrefix } from '@/navigation';
import { refreshAuthTokens } from '@/lib/session-actions';
import { getSession, updateSession, deleteSession } from '@/lib/session';

const publicPages = ['/login', '/terms', '/privacy'];
const publicPathnameRegex = new RegExp(`^(/(${locales.join('|')}))?(${publicPages.join('|')})/?$`, 'i');

const i18nMiddleware = createI18nMiddleware({
  locales,
  localePrefix,
  pathnames,
  defaultLocale: 'en',
});


async function handleAuth(request: NextRequest): Promise<NextResponse | undefined> {
  const session = await getSession();
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
  if (session && session.claims.exp * 1000 < Date.now()) {
    try {
      const refreshResult = await refreshAuthTokens(session.refreshToken);
      if (refreshResult) {
        const { newClaims, newAccessToken, newRefreshToken, newExpiresIn } = refreshResult;
        
        const newSessionPayload = {
          ...session,
          claims: newClaims,
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        };
        const { sessionId, ...dataToStore } = newSessionPayload;

        await updateSession(session.sessionId, dataToStore, newExpiresIn);

      } else {
        // Refresh failed, redirect to login and clear the cookie
        const loginUrl = new URL(pathnames['/login'], request.url);
        const response = NextResponse.redirect(loginUrl);
        response.cookies.set('session', '', { expires: new Date(0), path: '/' });
        // We don't need to call deleteSession from Redis here because the session has already expired and will be cleaned up.
        return response;
      }
    } catch(e) {
      console.error("Middleware refresh token error:", e);
      const loginUrl = new URL(pathnames['/login'], request.url);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.set('session', '', { expires: new Date(0), path: '/' });
      return response;
    }
  }

  // If we get here, the session is valid or the page is public, so we don't need to do anything.
  // Return undefined to allow the i18n middleware to run.
  return undefined;
}


export async function middleware(request: NextRequest) {
  const authResponse = await handleAuth(request);
  // If the authentication logic returned a response (e.g., a redirect), return it.
  if (authResponse) {
    return authResponse;
  }
  
  // Otherwise, proceed with the internationalization middleware.
  return i18nMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
