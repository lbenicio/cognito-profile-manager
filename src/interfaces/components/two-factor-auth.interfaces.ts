import type { User } from '@/types/user/user.types';

export interface TwoFactorAuthProps {
  user: User;
  onUpdate: (data: Partial<User>) => void;
}
