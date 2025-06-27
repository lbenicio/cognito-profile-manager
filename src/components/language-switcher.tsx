'use client';

import { useRouter } from '@/navigation';
import { useTransition } from 'react';
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { updateUserPreferences } from '@/lib/preference-actions';
import type { UserPreferences } from '@/lib/auth';

interface LanguageSwitcherProps {
  languageLabel: string;
  currentLanguage: UserPreferences['language'];
}

export function LanguageSwitcher({ languageLabel, currentLanguage }: LanguageSwitcherProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function onSelectLocale(nextLocale: UserPreferences['language']) {
    startTransition(async () => {
      await updateUserPreferences({ language: nextLocale });
      router.refresh();
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9" disabled={isPending}>
          <Globe />
          <span className="sr-only">{languageLabel}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onSelectLocale('en')} disabled={currentLanguage === 'en'}>
          English
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSelectLocale('es')} disabled={currentLanguage === 'es'}>
          Español
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
