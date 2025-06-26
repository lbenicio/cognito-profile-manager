import { getTranslations } from 'next-intl/server';
import { Toaster } from "@/components/ui/toaster";
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { getUser } from '@/lib/auth';

export default async function MainAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  const t = await getTranslations('Header');
  
  const headerTranslations = {
    title: t('title'),
    userMenu: {
      profile: t('userMenu.profile'),
      settings: t('userMenu.settings'),
      logout: t('userMenu.logout'),
      adminDashboard: t('userMenu.adminDashboard')
    },
    mobileMenuTrigger: t('mobileMenuTrigger'),
    mobileMenuTitle: t('mobileMenuTitle'),
    language: t('language')
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header user={user} translations={headerTranslations} />
      <main className="flex-1">{children}</main>
      <Footer />
      <Toaster />
    </div>
  );
}