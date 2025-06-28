import type { User } from '@/types/user/user.types';

export interface ProfileDisplayProps {
  user: User;
  onUpdateAction: (data: Partial<User>) => void;
}
