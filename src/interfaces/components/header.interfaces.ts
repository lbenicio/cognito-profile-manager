import type { User } from '@/types/user/user.types';

export interface HeaderTranslations {
  title: string;
  userMenu: {
    profile: string;
    settings: string;
    logout: string;
    adminDashboard: string;
    account: string;
    security: string;
  };
  mobileMenuTitle: string;
  mobileMenuTrigger: string;
  language: string;
}

export interface HeaderProps {
  user: User | null;
  translations: HeaderTranslations;
}
