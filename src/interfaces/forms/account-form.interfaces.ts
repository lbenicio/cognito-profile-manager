/**
 * Interfaces for the Account Form component.
 * Moved from types/forms/account-form.types.ts for consolidation.
 */

import type { User } from '@/types/user/user.types';

/**
 * Props for the AccountForm component.
 */
export interface AccountFormProps {
  user: User;
  onUpdateAction: (data: Partial<User>) => void;
}

/**
 * Type for Account Form values, inferred from the schema.
 * This should be kept in sync with the schema definition.
 */
export type AccountFormValues = {
  given_name: string;
  family_name: string;
  phone_number: string;
  birthdate?: Date;
  website?: string;
  zoneinfo?: string;
  gender?: string;
  aboutMe?: string;
};
