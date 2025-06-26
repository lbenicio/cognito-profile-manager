import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import {locales, localePrefix, pathnames} from './navigation';
 
export default function middleware(request: NextRequest) {
  const handleI18nRouting = createMiddleware({
    defaultLocale: 'en',
    locales,
    localePrefix,
    pathnames
  });
  
  const response = handleI18nRouting(request);
  const session = request.cookies.get('auth_session');
  const pathname = request.nextUrl.pathname;

  // Regex to check if the path is the login page, supporting optional locales.
  const isLoginPage = new RegExp(`^(/(${locales.join('|')}))?/login/?$`).test(pathname);
  
  // If the user is not on the login page and has no session, redirect them to the login page.
  if (!isLoginPage && !session) {
    const localeSegment = pathname.split('/')[1];
    const locale = locales.includes(localeSegment as any) ? localeSegment : 'en';
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }

  // If the user is on the login page but already has a session, redirect them to the homepage.
  if (isLoginPage && session) {
    const localeSegment = pathname.split('/')[1];
    const locale = locales.includes(localeSegment as any) ? localeSegment : 'en';
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }

  return response;
}
 
export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
