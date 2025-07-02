'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Save, Loader2 } from 'lucide-react';
import type {
  User as UserType,
  NotificationPreferences,
} from '@/types/user/user.types';
import { updateNotificationPreferences } from '@/lib/actions/notification.action';

interface NotificationSettingsProps {
  user: UserType;
}

export function NotificationSettings({ user }: NotificationSettingsProps) {
  const t = useTranslations('Settings.notifications');
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [prefs, setPrefs] = useState<NotificationPreferences>(
    user.notificationPreferences
  );

  const handleSwitchChange = (
    field: keyof NotificationPreferences,
    value: boolean
  ) => {
    setPrefs((current) => ({ ...current, [field]: value }));
  };

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateNotificationPreferences(prefs);
      if (result.success) {
        toast({
          title: t('successTitle'),
          description: t('successDescription'),
        });
      } else {
        toast({
          variant: 'destructive',
          title: t('errorTitle'),
          description: result.message,
        });
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent className='space-y-8'>
        {/* -- Communication Channels -- */}
        <div className='space-y-4'>
          <h4 className='font-semibold'>{t('channels.title')}</h4>
          <div className='flex items-center justify-between'>
            <Label htmlFor='email-notifications'>{t('channels.email')}</Label>
            <Switch
              id='email-notifications'
              checked={prefs.email}
              onCheckedChange={(value) => handleSwitchChange('email', value)}
              disabled={isPending}
            />
          </div>
          <div className='flex items-center justify-between'>
            <Label htmlFor='app-notifications'>{t('channels.app')}</Label>
            <Switch
              id='app-notifications'
              checked={prefs.app}
              onCheckedChange={(value) => handleSwitchChange('app', value)}
              disabled={isPending}
            />
          </div>
          <div className='flex items-center justify-between'>
            <Label htmlFor='telegram-notifications'>
              {t('channels.telegram')}
            </Label>
            <Switch
              id='telegram-notifications'
              checked={prefs.telegram}
              onCheckedChange={(value) => handleSwitchChange('telegram', value)}
              disabled={isPending}
            />
          </div>
        </div>

        <Separator />

        {/* -- Notification Types -- */}
        <div className='space-y-4'>
          <h4 className='font-semibold'>{t('types.title')}</h4>
          <div className='flex items-start justify-between'>
            <div className='pr-4'>
              <Label htmlFor='user-notifications'>
                {t('types.user.label')}
              </Label>
              <p className='text-sm text-muted-foreground'>
                {t('types.user.description')}
              </p>
            </div>
            <Switch
              id='user-notifications'
              checked={prefs.user}
              onCheckedChange={(value) => handleSwitchChange('user', value)}
              disabled={isPending}
            />
          </div>
          <div className='flex items-start justify-between'>
            <div className='pr-4'>
              <Label htmlFor='system-notifications'>
                {t('types.system.label')}
              </Label>
              <p className='text-sm text-muted-foreground'>
                {t('types.system.description')}
              </p>
            </div>
            <Switch
              id='system-notifications'
              checked={prefs.system}
              onCheckedChange={(value) => handleSwitchChange('system', value)}
              disabled={isPending}
            />
          </div>
          <div className='flex items-start justify-between'>
            <div className='pr-4'>
              <Label htmlFor='marketing-notifications'>
                {t('types.marketing.label')}
              </Label>
              <p className='text-sm text-muted-foreground'>
                {t('types.marketing.description')}
              </p>
            </div>
            <Switch
              id='marketing-notifications'
              checked={prefs.marketing}
              onCheckedChange={(value) =>
                handleSwitchChange('marketing', value)
              }
              disabled={isPending}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? <Loader2 className='animate-spin' /> : <Save />}
          <span className='ml-2'>{t('save')}</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
