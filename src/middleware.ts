import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from './middlewares/auth';
import { i18nMiddleware } from './middlewares/i18n';

export function middleware(request: NextRequest) {
  // Skip all middleware for API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  const authResponse = authMiddleware(request);
  if (authResponse) {
    return authResponse;
  }
  
  return i18nMiddleware(request);
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: ['/((?!_next|_vercel|.*\\..*).*)'],
};
