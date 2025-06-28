import { notFound } from 'next/navigation';
import { getRequestConfig, getLocale } from 'next-intl/server';

const locales = ['en', 'es'];

export default getRequestConfig(async () => {
  // Obtain the locale for the current request
  const locale = await getLocale();

  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale)) notFound();

  return {
    messages: (await import(`./locales/${locale}.json`)).default,
  };
});
