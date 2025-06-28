import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';
import { getLocale } from 'next-intl/server';

const locales = ['en', 'es'];

export default getRequestConfig(async () => {
  const locale = await getLocale();

  if (!locales.includes(locale)) notFound();

  return {
    messages: (await import(`./locales/${locale}.json`)).default,
  };
});
