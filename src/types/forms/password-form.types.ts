import * as z from 'zod';

/**
 * Schema for the Password Form using zod.
 * Accepts a translation function for error messages.
 */
export const passwordFormSchema = (t: (key: string) => string) =>
  z
    .object({
      currentPassword: z
        .string()
        .min(1, { message: 'Current password is required.' }),
      newPassword: z
        .string()
        .min(8, { message: 'New password must be at least 8 characters.' }),
      confirmPassword: z
        .string()
        .min(1, { message: 'Please confirm your new password.' }),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t('passwordMismatch'),
      path: ['confirmPassword'],
    });

/**
 * Type for Password Form values, inferred from the schema.
 */
export type PasswordFormValues = z.infer<ReturnType<typeof passwordFormSchema>>;
