import type { PublicProfilePreferences } from '@/types/user/user.types';

export interface ProfileSettingsFormProps {
  initialPreferences: PublicProfilePreferences;
  onUpdateAction: (newPrefs: PublicProfilePreferences) => void;
}
