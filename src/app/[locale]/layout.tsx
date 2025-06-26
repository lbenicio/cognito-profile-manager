import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { Toaster } from "@/components/ui/toaster";
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { ThemeProvider } from '@/components/theme-provider';
import { getUser } from '@/lib/auth';

// This layout is nested within the root layout at /app/layout.tsx
// It provides the i18n and theme context to all child pages.
export default async function LocaleLayout({
  children,
  params: {locale}
}: {
  children: React.ReactNode;
  params: {locale: string};
}) {
  const messages = await getMessages();
  const user = await getUser();
  const t = await getTranslations();

  // Pass the entire 'Header' namespace to the component for robustness.
  const headerTranslations = t.raw('Header');

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <Header user={user} translations={headerTranslations} />
        <main className="flex-grow flex flex-col">
          {children}
        </main>
        <Footer />
        <Toaster />
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
