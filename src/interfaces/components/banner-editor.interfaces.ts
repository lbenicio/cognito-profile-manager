import type { User } from '@/types/user/user.types';

export interface BannerEditorProps {
  user: User;
  onUpdateAction: (data: Partial<User>) => void;
  onCloseAction: () => void;
}
