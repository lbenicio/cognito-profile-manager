import createMiddleware from 'next-intl/middleware';
import { locales, localePrefix, pathnames } from '@/navigation';

export const i18nMiddleware = createMiddleware({
  locales,
  localePrefix,
  pathnames,
  defaultLocale: 'en',
});
