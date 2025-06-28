import type { User } from '@/types/user/user.types';

export interface AvatarEditorProps {
  user: User;
  onUpdateAction: (data: Partial<User>) => void;
  onCloseAction: () => void;
}
