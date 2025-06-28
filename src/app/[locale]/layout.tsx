import type { Metadata } from 'next';
import '../globals.css';
import { getMessages, unstable_setRequestLocale } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { ThemeProvider } from '@/components/theme-provider';
import { getUser } from '@/lib/auth';


export const metadata: Metadata = {
  title: 'Outpost',
  description: 'Manage your Outpost user profile',
};

// This is the root layout. It now includes the i18n and theme providers.
export default async function LocaleLayout(
  props: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
  }
) {
  const params = await props.params;

  const {
    children
  } = props;

  unstable_setRequestLocale(params.locale);
  const messages = await getMessages();
  const user = await getUser();

  const theme = user?.preferences?.theme || 'system';
  const fontSize = user?.preferences?.fontSize || 12;

  return (
    <html lang={params.locale} className="h-full" style={{ fontSize: `${fontSize}pt` }} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon/favicon.svg" sizes="any" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"></link>
      </head>
      <body className="font-body antialiased flex flex-col min-h-screen">
        <NextIntlClientProvider locale={params.locale} messages={messages}>
          <ThemeProvider
            attribute="class"
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
