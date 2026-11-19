import type { InputHTMLAttributes, ReactNode } from 'react';
import type {
  Fingerprint,
  PublicProfilePreferences,
  User,
  UserPreferences,
} from '@/types/user/user.types';

export interface AccountViewProps {
  initialUser: User;
}

export interface AppearanceSettingsProps {
  user: User;
}

export interface AccountDisplayProps {
  user: User;
  onUpdateAction: (data: Partial<User>) => void;
}

export interface AvatarEditorProps {
  user: User;
  onUpdateAction: (data: Partial<User>) => void;
  onCloseAction: () => void;
}

export interface BannerEditorProps {
  user: User;
  onUpdateAction: (data: Partial<User>) => void;
  onCloseAction: () => void;
}

export type ContactCategory = 'general' | 'billing' | 'technical' | 'feedback';

export interface ContactFormValues {
  category: ContactCategory | '';
  message: string;
}

export interface ContactFormProps {
  user: User;
  translations: {
    nameLabel: string;
    emailLabel: string;
    categoryLabel: string;
    categoryPlaceholder: string;
    messageLabel: string;
    messagePlaceholder: string;
    submitButton: string;
    successTitle: string;
    successDescription: string;
    errorTitle: string;
    errorDescription: string;
    categoryRequired: string;
    messageRequired: string;
    messageTooShort: string;
    categories: Record<ContactCategory, string>;
  };
}

export interface DashboardTranslations {
  welcome: string;
  description: string;
  id: string;
  lastLogin: string;
  verified: string;
  profileCard: {
    email: string;
    groups: string;
    noGroups: string;
  };
  editProfileButton: string;
  securityHealth: {
    title: string;
    description: string;
    score: string;
    manageButton: string;
    checks: {
      email: string;
      phone: string;
      twoFactor: string;
      passkeys: string;
    };
  };
  profileCompletion: {
    title: string;
    description: string;
    percentage: string;
    completeProfileButton: string;
    tasks: {
      picture: string;
      banner: string;
      aboutMe: string;
      address: string;
      phone: string;
      website: string;
    };
  };
  quickActions: {
    title: string;
    description: string;
    changePassword: string;
    manageSecurity: string;
    appearanceSettings: string;
  };
  loginHistory: {
    title: string;
    description: string;
    date: string;
    device: string;
    ipAddress: string;
    noHistory: string;
  };
  sessionInfo: {
    title: string;
    description: string;
    startedAt: string;
    expiresIn: string;
    currentDevice: string;
    ipAddress: string;
    expired: string;
  };
  messagesPreview: {
    title: string;
    description: string;
    noMessages: string;
    viewAllButton: string;
  };
  messages: {
    alertTitle: string;
  };
}

export interface DashboardViewProps {
  user: User;
  infoWidget: ReactNode;
  translations: DashboardTranslations;
}

export interface HeaderTranslations {
  title: string;
  userMenu: {
    profile: string;
    settings: string;
    logout: string;
    adminDashboard: string;
    account: string;
    security: string;
    messages: string;
  };
  mobileMenuTitle: string;
  mobileMenuTrigger: string;
  language: string;
}

export interface HeaderProps {
  user: User | null;
  translations: HeaderTranslations;
}

export interface LanguageSelectProps {
  currentLanguage: UserPreferences['language'];
  onLanguageChangeAction: (language: UserPreferences['language']) => void;
  disabled?: boolean;
}

export interface LanguageSwitcherProps {
  languageLabel: string;
  currentLanguage: UserPreferences['language'];
}

export interface LoginActivityChartProps {
  fingerprint: Fingerprint[];
}

export type LoginViewProps = Record<string, never>;

export interface NotificationSettingsProps {
  user: User;
}

export interface PasskeyManagementProps {
  user: User;
}

export interface PhoneInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'onChange' | 'value'
> {
  value: string;
  onChangeAction: (value: string) => void;
}

export interface ProfileSettingsFormProps {
  initialPreferences: PublicProfilePreferences;
  onUpdateAction: (newPrefs: PublicProfilePreferences) => void;
}

export interface ProfileDisplayProps {
  user: User;
  onUpdateAction: (data: Partial<User>) => void;
}

export interface ProfileViewProps {
  user: User;
}

export interface PublicProfileDisplayProps {
  user: User;
}

export interface SecurityViewProps {
  initialUser: User;
  translations: {
    title: string;
    description: string;
  };
}

export interface SessionInfoCardProps {
  user: User;
}

export interface TimezoneSelectProps {
  value: string;
  onChangeAction: (value: string) => void;
}

export interface ThemeProviderProps {
  children: ReactNode;
  attribute?: 'class' | 'data-theme';
  defaultTheme?: string;
  enableSystem?: boolean;
  storageKey?: string;
  disableTransitionOnChange?: boolean;
}

export interface TwoFactorAuthProps {
  user: User;
  onUpdateAction: (data: Partial<User>) => void;
}
