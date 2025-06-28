/**
 * Interfaces for Address Form.
 * Move AddressFormProps and AddressFormValues here for consolidation.
 */

import type { User } from '@/types/user/user.types';
import type { z } from 'zod';
import type { addressFormSchema } from '@/types/forms/address-form.types';

/**
 * Type for Address Form values, inferred from the schema.
 */
export type AddressFormValues = z.infer<ReturnType<typeof addressFormSchema>>;

/**
 * Props for the AddressForm component.
 */
export interface AddressFormProps {
  user: User;
  onUpdateAction: (data: Partial<User>) => void;
}
