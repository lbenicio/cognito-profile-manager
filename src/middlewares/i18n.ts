import { NextRequest } from 'next/server';
import createI18nMiddleware from 'next-intl/middleware';
import { pathnames, locales, localePrefix } from '@/navigation';

/**
 * i18n middleware for locale detection and routing.
 * This should be composed in the main middleware entrypoint.
 */
const i18nMiddleware = createI18nMiddleware({
  locales,
  localePrefix,
  pathnames,
  defaultLocale: 'en',
});

export function handleI18n(request: NextRequest) {
  return i18nMiddleware(request);
}
