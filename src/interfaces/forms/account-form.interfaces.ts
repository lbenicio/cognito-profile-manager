import type { User } from '@/types/user/user.types';
import type { AccountFormValues } from '@/types/forms/account-form.types';

/**
 * Props for the AccountForm component.
 */
export interface AccountFormProps {
  user: User;
  onUpdateAction: (data: Partial<User>) => void;
}

// Re-export for convenience if needed, but primary source is the types file.
export type { AccountFormValues };
