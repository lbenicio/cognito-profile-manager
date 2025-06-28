/**
 * Interfaces for the Account Form component.
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
 * Type for Account Form values, kept in sync with the schema definition.
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
