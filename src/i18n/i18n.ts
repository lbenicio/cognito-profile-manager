import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';

export const locales = ['en', 'es', 'fr', 'de', 'pt'] as const;
export const defaultLocale = 'en';

export default getRequestConfig(async () => {
  // Determine locale from cookie or Accept-Language header
  let locale = defaultLocale;

  try {
    // First, try to get locale from cookie
    const cookieStore = await cookies();
    const localeCookie = cookieStore.get('locale')?.value;

    if (localeCookie && locales.includes(localeCookie as any)) {
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
          if (locales.includes(preferredLocale as any)) {
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
  if (!locales.includes(locale as any)) {
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
