import { AppearanceSettings } from '@/components/appearance-settings';
import { NotificationSettings } from '@/components/notification-settings';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { getUser } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export default async function SettingsPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const params = await props.params;
  unstable_setRequestLocale(params.locale);
  const user = await getUser();

  if (!user) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <div className='space-y-4 text-center'>
          <h1 className='text-2xl font-bold'>Authentication Error</h1>
          <p className='text-muted-foreground'>
            Could not load user data. Please try logging out and signing in
            again.
          </p>
          <Button asChild>
            <a href='/api/v1/auth/logout'>
              <LogOut className='mr-2 h-4 w-4' />
              Log Out
            </a>
          </Button>
        </div>
      </div>
    );
  }

  const t = await getTranslations('Settings');

  return (
    <div className='container mx-auto p-4 md:p-8'>
      <header className='mb-8'>
        <h1 className='text-3xl font-bold tracking-tight'>{t('title')}</h1>
        <p className='text-muted-foreground'>{t('description')}</p>
      </header>
      <div className='grid grid-cols-1 items-start gap-8 md:grid-cols-2'>
        <AppearanceSettings user={user} />
        <NotificationSettings user={user} />
      </div>
    </div>
  );
}
