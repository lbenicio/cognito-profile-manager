'use client';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import type { User as UserType } from '@/lib/auth';

interface ProfileViewProps {
    user: UserType;
}

export function ProfileView({ user }: ProfileViewProps) {
  const t = useTranslations('Profile');

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">
              {t('description')}
          </p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>{t('preview.title')}</CardTitle>
                    <CardDescription>{t('preview.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">{t('preview.comingSoon')}</p>
                </CardContent>
            </Card>
        </div>
        <div className="md:col-span-1">
            <Card>
                <CardHeader>
                    <CardTitle>{t('settings.title')}</CardTitle>
                    <CardDescription>{t('settings.description')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="profile-visibility" className="flex-grow pr-4">{t('settings.visibilityLabel')}</Label>
                        <Switch id="profile-visibility" />
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
