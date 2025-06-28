import { notFound } from 'next/navigation';
import { getLocale, getRequestConfig } from 'next-intl/server';

const locales = ['en', 'es'];

export default getRequestConfig(async () => {
  const locale = await getLocale();

  // Validate that the returned locale is supported
  if (!locales.includes(locale)) {
    notFound();
  }

  return {
    messages: (await import(`./locales/${locale}.json`)).default,
  };
});
