'use client';

import type { LanguageSelectProps } from '@/types/components.types';
import { useTranslations } from 'next-intl';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { UserPreferences } from '@/types/user/user.types';

export function LanguageSelect({
  currentLanguage,
  onLanguageChangeAction,
  disabled,
}: LanguageSelectProps) {
  const t = useTranslations('Settings.appearance');

  return (
    <Select
      defaultValue={currentLanguage}
      onValueChange={(value: UserPreferences['language']) =>
        onLanguageChangeAction(value)
      }
      disabled={disabled}
    >
      <SelectTrigger>
        <SelectValue placeholder={t('language')} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value='en'>{t('english')}</SelectItem>
        <SelectItem value='es'>{t('spanish')}</SelectItem>
        <SelectItem value='fr'>{t('french')}</SelectItem>
        <SelectItem value='de'>{t('german')}</SelectItem>
        <SelectItem value='pt'>{t('portuguese')}</SelectItem>
      </SelectContent>
    </Select>
  );
}
