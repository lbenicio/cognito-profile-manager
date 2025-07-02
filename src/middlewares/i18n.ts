import { NextRequest, NextResponse } from 'next/server';

const locales = ['en', 'es', 'fr', 'de', 'pt'];
const defaultLocale = 'en';

/**
 * i18n middleware for locale detection without URL-based routing.
 * Sets locale in cookies based on Accept-Language header or existing cookie.
 */
export function handleI18n(request: NextRequest) {
  // Get current locale from cookie
  const currentLocale = request.cookies.get('locale')?.value;

  // If we have a valid locale cookie, continue with no modifications
  if (currentLocale && locales.includes(currentLocale)) {
    return NextResponse.next();
  }

  // Determine the best locale from Accept-Language header
  const acceptLanguage = request.headers.get('accept-language');
  let detectedLocale = defaultLocale;

  if (acceptLanguage) {
    // Parse Accept-Language header
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

    // Find the first supported locale
    for (const { locale } of preferredLocales) {
      if (locales.includes(locale)) {
        detectedLocale = locale;
        break;
      }
    }
  }

  // Create response and set the locale cookie
  const response = NextResponse.next();
  response.cookies.set('locale', detectedLocale, {
    path: '/',
    maxAge: 31536000, // 1 year
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  });

  return response;
}
