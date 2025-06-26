'use client';

import { useRouter } from '@/navigation';
import { useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { setLocale } from '@/lib/locale-actions';

export function LanguageSelect() {
  const t = useTranslations('Settings.appearance');
  const [isPending, startTransition] = useTransition();
  const locale = useLocale();
  const router = useRouter();

  function onSelectChange(value: string) {
    startTransition(async () => {
      await setLocale(value);
      router.refresh();
    });
  }

  return (
    <Select defaultValue={locale} onValueChange={onSelectChange} disabled={isPending}>
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
