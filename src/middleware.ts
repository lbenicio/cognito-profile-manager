import { NextRequest } from 'next/server';
import { authMiddleware } from './middlewares/auth';
import { i18nMiddleware } from './middlewares/i18n';

export async function middleware(request: NextRequest) {
  const authResponse = await authMiddleware(request);
  if (authResponse) {
    return authResponse;
  }
  
  return i18nMiddleware(request);
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
