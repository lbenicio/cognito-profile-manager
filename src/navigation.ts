/*
  [MIGRATION NOTE]
  In next-intl v3+, navigation helpers like Link, usePathname, useRouter, and redirect
  are no longer exported from 'next-intl/navigation'. Use Next.js built-in navigation
  utilities (e.g., 'next/link', 'next/navigation') and handle locale in your routes as needed.
*/

export const locales = ['en', 'es', 'fr', 'de', 'pt'];

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
