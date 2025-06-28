import * as z from 'zod';
import type { User } from '@/types/api/user.types';

/**
 * Schema for the Profile Form using zod.
 * Accepts a translation function for error messages.
 */
export const profileFormSchema = (t: (key: string) => string) =>
  z.object({
    given_name: z
      .string()
      .min(1, { message: t('givenNameRequired') })
      .max(50),
    family_name: z
      .string()
      .min(1, { message: t('familyNameRequired') })
      .max(50),
    address: z
      .string()
      .min(10, { message: 'Please enter a full address.' })
      .max(100),
    phone_number: z
      .string()
      .refine((phone) => /^\+[1-9]\d{7,14}$/.test(phone), {
        message: t('phoneInvalid'),
      }),
    birthdate: z.date().optional(),
    website: z
      .string()
      .url({ message: 'Please enter a valid URL.' })
      .or(z.literal(''))
      .optional(),
    zoneinfo: z.string().max(50).optional(),
    gender: z.string().optional(),
    aboutMe: z
      .string()
      .max(250, { message: t('aboutMeTooLong') })
      .optional(),
  });

/**
 * Type for Profile Form values, inferred from the schema.
 */
export type ProfileFormValues = z.infer<ReturnType<typeof profileFormSchema>>;

/**
 * Props for the ProfileForm component.
 */
export interface ProfileFormProps {
  user: User;
  onUpdate: (data: Partial<User>) => void;
}
