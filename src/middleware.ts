import { NextRequest } from 'next/server';
import { handleI18n } from './middlewares/i18n';
import { authMiddleware } from './middlewares/auth';

export function middleware(request: NextRequest) {
  // Run authentication middleware first
  const authResult = authMiddleware(request);
  if (authResult) {
    return authResult;
  }

  // Run i18n middleware if authentication passes
  return handleI18n(request);
}

export const config = {
  // Skip all paths that should not be internationalized. This example skips the
  // folders "api", "_next" and all files with an extension (e.g. favicon.ico)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
