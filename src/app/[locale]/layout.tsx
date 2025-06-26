import type { Metadata } from 'next';
import '../globals.css';
import { getMessages, unstable_setRequestLocale } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { ThemeProvider } from '@/components/theme-provider';


export const metadata: Metadata = {
  title: 'Outpost',
  description: 'Manage your Outpost user profile',
};

// This is the root layout. It now includes the i18n and theme providers.
export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  unstable_setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} className="h-full" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon/favicon.svg" sizes="any" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"></link>
        <script
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  try {
                    var fontSize = localStorage.getItem('font-size') || '14';
                    document.documentElement.style.fontSize = fontSize + 'pt';
                  } catch (e) {}
                })();
              `,
            }}
          />
      </head>
      <body className="font-body antialiased flex flex-col min-h-screen">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
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
