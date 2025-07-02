import { createSharedPathnamesNavigation } from 'next-intl/navigation';

export const locales = ['en', 'es', 'fr', 'de', 'pt'];

export const { Link, redirect, usePathname, useRouter } =
  createSharedPathnamesNavigation({ locales });

// Helper function to set locale in cookie
export function setLocaleCookie(locale: string) {
  if (typeof document !== 'undefined') {
    document.cookie = `locale=${locale}; path=/; max-age=31536000; SameSite=Lax`;
  }
}

// Helper function to get current locale from cookie
export function getLocaleCookie(): string | null {
  if (typeof document === 'undefined') return null;

  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'locale') {
      return value;
    }
  }
  return null;
}

// Pathnames remain the same since we're not using localized routing
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
  '/messages': '/messages',
};
