import * as z from 'zod';

export const passwordFormSchema = (t: (key: string) => string) =>
  z
    .object({
      currentPassword: z
        .string()
        .min(1, { message: 'Current password is required.' }),
      newPassword: z
        .string()
        .min(8, { message: 'Password must be at least 8 characters.' }),
      confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t('passwordMismatch'),
      path: ['confirmPassword'],
    });

export type PasswordFormValues = z.infer<ReturnType<typeof passwordFormSchema>>;
