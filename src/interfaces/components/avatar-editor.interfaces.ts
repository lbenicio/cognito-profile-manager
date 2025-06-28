import type { User } from '@/types/user/user.types';

export interface AvatarEditorProps {
  user: User;
  onUpdate: (data: Partial<User>) => void;
  onClose: () => void;
}
