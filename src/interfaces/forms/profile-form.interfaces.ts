import type { User } from '@/types/user/user.types';
import type { ProfileFormValues } from '@/types/forms/profile-form.types';

/**
 * Props for the ProfileForm component.
 */
export interface ProfileFormProps {
  user: User;
  onUpdateAction: (data: Partial<User>) => void;
}

// Re-export for convenience if needed, but primary source is the types file.
export type { ProfileFormValues };
