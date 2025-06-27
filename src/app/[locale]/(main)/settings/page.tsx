
import { AppearanceSettings } from '@/components/appearance-settings';
import { NotificationSettings } from '@/components/notification-settings';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { getUser } from '@/lib/auth';
import { redirect } from '@/navigation';

export default async function SettingsPage({params: {locale}}: {params: {locale: string}}) {
  unstable_setRequestLocale(locale);
  const user = await getUser();

  if (!user) {
    redirect('/login');
  }
  
  const t = await getTranslations('Settings');

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-6">
        <header>
            <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
            <p className="text-muted-foreground">
                {t('description')}
            </p>
        </header>
        <div className="max-w-3xl space-y-8">
            <AppearanceSettings user={user} />
            <NotificationSettings user={user} />
        </div>
    </div>
  );
}
