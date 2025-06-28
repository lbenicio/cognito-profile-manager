import type { Metadata } from 'next';
import type { User } from '@/types/user/user.types';
import '../globals.css';
import '../fonts.css';
import { getMessages, unstable_setRequestLocale } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { ThemeProvider } from '@/components/theme-provider';
import { getUser } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Outpost',
  description: 'Manage your Outpost user profile',
};

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: {
    locale: string;
  };
}

// This is the root layout. It now includes the i18n and theme providers.
export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps): Promise<JSX.Element> {
  unstable_setRequestLocale(params.locale);
  const messages = await getMessages();
  const user: User | null = await getUser();

  const theme: string = user?.preferences?.theme || 'system';
  const fontSize: number = user?.preferences?.fontSize || 12;

  return (
    <html
      lang={params.locale}
      className='h-full'
      style={{ fontSize: `${fontSize}pt` }}
      suppressHydrationWarning
    >
      <head>
        <link
          rel='icon'
          href='/favicon/favicon.svg'
          sizes='any'
          type='image/svg+xml'
        />
        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link
          rel='preconnect'
          href='https://fonts.gstatic.com'
          crossOrigin='anonymous'
        />
      </head>
      <body className='flex min-h-screen flex-col font-body antialiased'>
        <NextIntlClientProvider locale={params.locale} messages={messages}>
          <ThemeProvider
            attribute='class'
            defaultTheme={theme}
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
