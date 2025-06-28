import type { User } from '@/types/user/user.types';

export interface SecurityViewProps {
  initialUser: User;
  translations: {
    title: string;
    description: string;
  };
}
