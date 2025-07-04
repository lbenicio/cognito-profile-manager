'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { Languages } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { updateUserPreferences } from '@/actions/preference.action';
import { setLocaleCookie, getLocaleCookie } from '@/navigation';
import type { UserPreferences } from '@/types/user/user.types';

interface LanguageSwitcherProps {
  languageLabel: string;
  currentLanguage: UserPreferences['language'];
}

export function LanguageSwitcher({
  languageLabel,
  currentLanguage,
}: LanguageSwitcherProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function onSelectLocale(nextLocale: UserPreferences['language']) {
    startTransition(async () => {
      // Update both user preferences and locale cookie
      await updateUserPreferences({ language: nextLocale });
      setLocaleCookie(nextLocale);
      router.refresh();
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className='h-9 w-9'
          disabled={isPending}
        >
          <Languages />
          <span className='sr-only'>{languageLabel}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem
          onClick={() => onSelectLocale('en')}
          disabled={currentLanguage === 'en'}
        >
          English
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onSelectLocale('es')}
          disabled={currentLanguage === 'es'}
        >
          Español
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onSelectLocale('fr')}
          disabled={currentLanguage === 'fr'}
        >
          Français
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onSelectLocale('de')}
          disabled={currentLanguage === 'de'}
        >
          Deutsch
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onSelectLocale('pt')}
          disabled={currentLanguage === 'pt'}
        >
          Português
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
