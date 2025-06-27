
import { AppearanceSettings } from '@/components/appearance-settings';
import { NotificationSettings } from '@/components/notification-settings';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { getUser } from '@/lib/auth';

export default async function SettingsPage({params: {locale}}: {params: {locale: string}}) {
  unstable_setRequestLocale(locale);
  const user = await getUser();

  if (!user) {
    return (
        <div className="flex items-center justify-center h-screen">
            <div className="text-center">
                <h1 className="text-2xl font-bold">Authentication Error</h1>
                <p className="text-muted-foreground">Could not load user data. Please try logging out and signing in again.</p>
            </div>
        </div>
    );
  }
  
  const t = await getTranslations('Settings');

  return (
    <div className="container mx-auto p-4 md:p-8">
        <header className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
            <p className="text-muted-foreground">
                {t('description')}
            </p>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <AppearanceSettings user={user} />
            <NotificationSettings user={user} />
        </div>
    </div>
  );
}
