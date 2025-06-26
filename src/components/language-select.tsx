'use client';

import { usePathname, useRouter } from '@/navigation';
import { useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function LanguageSelect() {
  const t = useTranslations('Settings.appearance');
  const [isPending, startTransition] = useTransition();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function onSelectChange(value: string) {
    startTransition(() => {
      router.replace(pathname, { locale: value });
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
