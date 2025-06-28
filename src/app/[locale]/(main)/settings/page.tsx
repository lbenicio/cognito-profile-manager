import type { User } from '@/types/user/user.types';
import type { SettingsPageProps } from '@/interfaces/app/page-props.interfaces';
import { AppearanceSettings } from '@/components/appearance-settings';
import { NotificationSettings } from '@/components/notification-settings';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { getUser } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { localLogout } from '@/lib/auth-actions';

export default async function SettingsPage({
  params,
}: SettingsPageProps): Promise<JSX.Element> {
  unstable_setRequestLocale(params.locale);
  const user: User | null = await getUser();
  const t = await getTranslations();

  if (!user) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <div className='space-y-4 text-center'>
          <h1 className='text-2xl font-bold'>Authentication Error</h1>
          <p className='text-muted-foreground'>
            Could not load user data. Please try logging out and signing in
            again.
          </p>
          <form action={localLogout}>
            <Button type='submit'>
              <LogOut className='mr-2 h-4 w-4' />
              {t('Header.userMenu.logout')}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto p-4 md:p-8'>
      <header className='mb-8'>
        <h1 className='text-3xl font-bold tracking-tight'>
          {t('Settings.title')}
        </h1>
        <p className='text-muted-foreground'>{t('Settings.description')}</p>
      </header>
      <div className='grid grid-cols-1 items-start gap-8 md:grid-cols-2'>
        <AppearanceSettings user={user} />
        <NotificationSettings user={user} />
      </div>
    </div>
  );
}
