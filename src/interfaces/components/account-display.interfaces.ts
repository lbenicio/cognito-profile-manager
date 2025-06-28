import type { User } from '@/types/user/user.types';

export interface AccountDisplayProps {
  user: User;
  onUpdateAction: (data: Partial<User>) => void;
}
