import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';
import { defaultLocale, isLocale, locales } from '@/types/i18n.types';

export { defaultLocale, locales };

export default getRequestConfig(async () => {
  // Determine locale from cookie or Accept-Language header
  let locale = defaultLocale;

  try {
    // First, try to get locale from cookie
    const cookieStore = await cookies();
    const localeCookie = cookieStore.get('locale')?.value;

    if (localeCookie && isLocale(localeCookie)) {
      locale = localeCookie;
    } else {
      // Fallback to Accept-Language header
      const headersList = await headers();
      const acceptLanguage = headersList.get('accept-language');

      if (acceptLanguage) {
        // Parse Accept-Language header and find the best match
        const preferredLocales = acceptLanguage
          .split(',')
          .map((lang) => {
            const [localeCode, qValue] = lang.trim().split(';q=');
            const normalizedLocale = localeCode.split('-')[0]; // Convert 'en-US' to 'en'
            return {
              locale: normalizedLocale,
              quality: qValue ? parseFloat(qValue) : 1.0,
            };
          })
          .sort((a, b) => b.quality - a.quality);

        for (const { locale: preferredLocale } of preferredLocales) {
          if (isLocale(preferredLocale)) {
            locale = preferredLocale;
            break;
          }
        }
      }
    }
  } catch (error) {
    // If anything fails, use default locale
    // Only log in development to avoid console noise in production
    if (process.env.NODE_ENV === 'development') {
      console.warn('Failed to determine locale, using default:', error);
    }
    locale = defaultLocale;
  }

  // Validate locale
  if (!isLocale(locale)) {
    locale = defaultLocale;
  }

  try {
    return {
      locale,
      messages: (await import(`./locales/${locale}.json`)).default,
    };
  } catch (error) {
    // Only log in development to avoid console noise in production
    if (process.env.NODE_ENV === 'development') {
      console.error(`Failed to load messages for locale ${locale}:`, error);
    }
    // Fallback to default locale messages
    return {
      locale: defaultLocale,
      messages: (await import(`./locales/${defaultLocale}.json`)).default,
    };
  }
});
