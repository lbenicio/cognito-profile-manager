'use client';

import { useTransition } from 'react';
import { useTheme } from 'next-themes';
import { Moon, Palette, Sun } from 'lucide-react';
import { useTranslations } from 'next-intl';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { LanguageSelect } from './language-select';
import { updateUserPreferences } from '@/actions/preference.action';
import { useToast } from '@/hooks/use-toast';
import type { User as UserType, UserPreferences } from '@/types/user/user.types';

interface AppearanceSettingsProps {
  user: UserType;
}

export function AppearanceSettings({ user }: AppearanceSettingsProps) {
  const t = useTranslations('Settings.appearance');
  const { setTheme } = useTheme();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const handlePreferenceChange = (newPrefs: Partial<UserPreferences>) => {
    startTransition(async () => {
      // Optimistically update the UI theme immediately
      if (newPrefs.theme) {
        setTheme(newPrefs.theme);
      }
      // Optimistically update the font size immediately
      if (newPrefs.fontSize) {
        document.documentElement.style.fontSize = `${newPrefs.fontSize}pt`;
      }

      const result = await updateUserPreferences(newPrefs);
      if (!result.success) {
        toast({
          variant: 'destructive',
          title: t('updateErrorTitle'),
          description: result.message,
        });
      }
    });
  };

  const handleFontSizeChange = (value: number[]) => {
    const newSize = value[0];
    if (newSize) {
      handlePreferenceChange({ fontSize: newSize });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent className='space-y-8'>
        <div>
          <Label className='font-semibold'>{t('theme')}</Label>
          <RadioGroup
            defaultValue={user.preferences.theme}
            onValueChange={(theme: UserPreferences['theme']) =>
              handlePreferenceChange({ theme })
            }
            className='grid grid-cols-1 gap-4 pt-4 sm:grid-cols-3'
            disabled={isPending}
          >
            <div>
              <RadioGroupItem
                value='light'
                id='light'
                className='peer sr-only'
              />
              <Label
                htmlFor='light'
                className='flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary'
              >
                <Sun className='mb-3 h-6 w-6' />
                {t('light')}
              </Label>
            </div>
            <div>
              <RadioGroupItem value='dark' id='dark' className='peer sr-only' />
              <Label
                htmlFor='dark'
                className='flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary'
              >
                <Moon className='mb-3 h-6 w-6' />
                {t('dark')}
              </Label>
            </div>
            <div>
              <RadioGroupItem
                value='system'
                id='system'
                className='peer sr-only'
              />
              <Label
                htmlFor='system'
                className='flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary'
              >
                <Palette className='mb-3 h-6 w-6' />
                {t('system')}
              </Label>
            </div>
          </RadioGroup>
        </div>

        <Separator />

        <div className='space-y-4'>
          <Label htmlFor='text-size-slider' className='font-semibold'>
            {t('textSize')}
          </Label>
          <div className='flex items-center gap-4 pt-2'>
            <Slider
              id='text-size-slider'
              min={10}
              max={20}
              step={1}
              defaultValue={[user.preferences.fontSize]}
              onValueCommit={handleFontSizeChange}
              disabled={isPending}
            />
            <span className='w-12 text-right text-sm text-muted-foreground'>
              {user.preferences.fontSize}pt
            </span>
          </div>
        </div>

        <Separator />

        <div className='space-y-2'>
          <Label className='font-semibold'>{t('language')}</Label>
          <LanguageSelect
            currentLanguage={user.preferences.language}
            onLanguageChangeAction={(language: UserPreferences['language']) =>
              handlePreferenceChange({ language })
            }
            disabled={isPending}
          />
        </div>
      </CardContent>
    </Card>
  );
}
