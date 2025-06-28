import type { User } from '@/types/user/user.types';
import type { HeaderTranslations } from '@/interfaces/components/header.interfaces';
import { getTranslations } from 'next-intl/server';
import { Toaster } from '@/components/ui/toaster';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { getUser } from '@/lib/auth';

interface MainAppLayoutProps {
  children: React.ReactNode;
}

export default async function MainAppLayout({
  children,
}: MainAppLayoutProps): Promise<JSX.Element> {
  const user: User | null = await getUser();
  const t = await getTranslations('Header');

  const headerTranslations: HeaderTranslations = {
    title: t('title'),
    userMenu: {
      profile: t('userMenu.profile'),
      settings: t('userMenu.settings'),
      logout: t('userMenu.logout'),
      adminDashboard: t('userMenu.adminDashboard'),
      account: t('userMenu.account'),
      security: t('userMenu.security'),
    },
    mobileMenuTitle: t('mobileMenuTitle'),
    mobileMenuTrigger: t('mobileMenuTrigger'),
    language: t('language'),
  };

  return (
    <div className='flex min-h-screen flex-col'>
      <Header user={user} translations={headerTranslations} />
      <main className='flex-1'>{children}</main>
      <Footer />
      <Toaster />
    </div>
  );
}
