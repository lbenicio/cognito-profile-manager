import type { User } from '@/types/user/user.types';

/**
 * Props for the AddressForm component.
 */
export interface AddressFormProps {
  user: User;
  onUpdateAction: (data: Partial<User>) => void;
}
