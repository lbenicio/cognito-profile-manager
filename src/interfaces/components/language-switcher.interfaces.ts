import type { UserPreferences } from '@/types/user/user.types';

export interface LanguageSwitcherProps {
  languageLabel: string;
  currentLanguage: UserPreferences['language'];
}
