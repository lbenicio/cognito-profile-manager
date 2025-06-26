import { AppearanceSettings } from '@/components/appearance-settings';
import { getTranslations } from 'next-intl/server';

export default async function SettingsPage() {
  const t = await getTranslations('Settings');

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-6">
        <header>
            <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
            <p className="text-muted-foreground">
                {t('description')}
            </p>
        </header>
        <div className="max-w-3xl">
            <AppearanceSettings />
        </div>
    </div>
  );
}