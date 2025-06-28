import {
  createLocalizedPathnamesNavigation,
  Pathnames,
} from 'next-intl/navigation';

export const locales = ['en', 'es', 'fr', 'de', 'pt'];
export const localePrefix = 'never';

export const pathnames = {
  '/': '/',
  '/profile': '/profile',
  '/settings': '/settings',
  '/login': '/login',
  '/account': '/account',
  '/security': '/security',
  '/contact': '/contact',
  '/terms': '/terms',
  '/privacy': '/privacy',
} satisfies Pathnames<typeof locales>;

export const { Link, redirect, usePathname, useRouter } =
  createLocalizedPathnamesNavigation({
    locales,
    localePrefix,
    pathnames,
  });
