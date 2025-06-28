import { notFound } from 'next/navigation';
import {
  getRequestConfig,
  GetRequestConfigParams,
  RequestConfig,
} from 'next-intl/server';

const locales = ['en', 'es', 'fr', 'de', 'pt'];

export default getRequestConfig(
  async (requestConfig: GetRequestConfigParams) => {
    const locale = requestConfig.locale;
    // Validate that the incoming `locale` parameter is valid
    if (!locales.includes(locale as any)) notFound();

    return {
      locale,
      messages: (await import(`./locales/${locale}.json`)).default,
    } as RequestConfig;
  }
);
