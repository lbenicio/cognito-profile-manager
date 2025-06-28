/**
 * Interfaces for the Profile Form component.
 * Moved from types/forms/profile-form.types.ts for consolidation.
 */

import type { User } from '@/types/user/user.types';

/**
 * Props for the ProfileForm component.
 */
export interface ProfileFormProps {
  user: User;
  onUpdateAction: (data: Partial<User>) => void;
}

/**
 * Type for Profile Form values, inferred from the schema.
 * This should be kept in sync with the zod schema in types/forms/profile-form.types.ts.
 */
export type ProfileFormValues = {
  given_name: string;
  family_name: string;
  address: string;
  phone_number: string;
  birthdate?: Date;
  website?: string;
  zoneinfo?: string;
  gender?: string;
  aboutMe?: string;
};
