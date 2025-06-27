'use client';

import { useTranslations } from 'next-intl';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { UserPreferences } from '@/lib/auth';

interface LanguageSelectProps {
  currentLanguage: UserPreferences['language'];
  onLanguageChange: (language: UserPreferences['language']) => void;
  disabled?: boolean;
}

export function LanguageSelect({ currentLanguage, onLanguageChange, disabled }: LanguageSelectProps) {
  const t = useTranslations('Settings.appearance');

  return (
    <Select
      defaultValue={currentLanguage}
      onValueChange={(value: UserPreferences['language']) => onLanguageChange(value)}
      disabled={disabled}
    >
      <SelectTrigger>
        <SelectValue placeholder={t('language')} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="en">{t('english')}</SelectItem>
        <SelectItem value="es">{t('spanish')}</SelectItem>
      </SelectContent>
    </Select>
  );
}
