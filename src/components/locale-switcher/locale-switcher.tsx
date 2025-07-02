'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Languages } from 'lucide-react';
import { setLocaleCookie, getLocaleCookie } from '@/navigation';

const locales = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'pt', name: 'Português' },
];

export function LocaleSwitcher() {
  const t = useTranslations('Settings.appearance');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [currentLocale, setCurrentLocale] = useState(
    () => getLocaleCookie() || 'en'
  );

  const handleLocaleChange = (newLocale: string) => {
    if (newLocale === currentLocale) return;

    startTransition(() => {
      setLocaleCookie(newLocale);
      setCurrentLocale(newLocale);
      // Refresh the page to apply the new locale
      router.refresh();
    });
  };

  const getCurrentLocaleName = () => {
    return locales.find(locale => locale.code === currentLocale)?.name || 'English';
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isPending}>
          <Languages className="h-4 w-4 mr-2" />
          {getCurrentLocaleName()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((locale) => (
          <DropdownMenuItem
            key={locale.code}
            onClick={() => handleLocaleChange(locale.code)}
            className={currentLocale === locale.code ? 'bg-accent' : ''}
          >
            {locale.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
