import type { User } from '@/types/user/user.types';

export interface ProfileDisplayProps {
  user: User;
  onUpdate: (data: Partial<User>) => void;
}
