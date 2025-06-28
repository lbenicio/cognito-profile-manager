import type { UserPreferences } from '@/types/user/user.types';

export interface LanguageSelectProps {
  currentLanguage: UserPreferences['language'];
  onLanguageChange: (language: UserPreferences['language']) => void;
  disabled?: boolean;
}
