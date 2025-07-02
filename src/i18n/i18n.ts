import { notFound } from 'next/navigation';
import {
  getRequestConfig,
  GetRequestConfigParams,
  RequestConfig,
} from 'next-intl/server';
import { headers, cookies } from 'next/headers';

const locales = ['en', 'es', 'fr', 'de', 'pt'];
const defaultLocale = 'en';

async function getLocale(): Promise<string> {
  // First, try to get locale from cookie
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get('locale')?.value;

  if (localeCookie && locales.includes(localeCookie)) {
    return localeCookie;
  }

  // Fallback to Accept-Language header
  const headersList = await headers();
  const acceptLanguage = headersList.get('accept-language');

  if (acceptLanguage) {
    // Parse Accept-Language header and find the best match
    const preferredLocales = acceptLanguage
      .split(',')
      .map(lang => {
        const [locale, qValue] = lang.trim().split(';q=');
        const normalizedLocale = locale.split('-')[0]; // Convert 'en-US' to 'en'
        return {
          locale: normalizedLocale,
          quality: qValue ? parseFloat(qValue) : 1.0
        };
      })
      .sort((a, b) => b.quality - a.quality);

    for (const { locale } of preferredLocales) {
      if (locales.includes(locale)) {
        return locale;
      }
    }
  }

  // Default fallback
  return defaultLocale;
}

export default getRequestConfig(
  async (requestConfig: GetRequestConfigParams) => {
    // Get locale from our custom logic instead of requestConfig.locale
    const locale = await getLocale();

    // Validate that the detected locale is valid
    if (!locales.includes(locale)) {
      return {
        locale: defaultLocale,
        messages: (await import(`./locales/${defaultLocale}.json`)).default,
      } as RequestConfig;
    }

    return {
      locale,
      messages: (await import(`./locales/${locale}.json`)).default,
    } as RequestConfig;
  }
);

export { locales, defaultLocale, getLocale };
