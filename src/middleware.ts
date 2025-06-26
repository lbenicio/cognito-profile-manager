import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import {locales, localePrefix, pathnames} from './navigation';
 
export default function middleware(request: NextRequest) {
  // This middleware is responsible for matching a locale for the request
  // and providing it to server components.
  const handleI18nRouting = createMiddleware({
    defaultLocale: 'en',
    locales,
    localePrefix,
    pathnames
  });
  
  const response = handleI18nRouting(request);

  // The rest of the middleware logic for authentication
  const session = request.cookies.get('auth_session');
  const pathname = request.nextUrl.pathname;

  // With cookie-based routing, the login page is at the root path.
  const isLoginPage = pathname === '/login';
  
  // If the user is not on the login page and has no session, redirect them.
  if (!isLoginPage && !session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If the user is on the login page but already has a session, redirect them to the homepage.
  if (isLoginPage && session) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return response;
}
 
export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
