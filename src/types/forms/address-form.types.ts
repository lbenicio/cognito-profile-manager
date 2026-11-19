import * as z from 'zod';
import type { User } from '@/types/user/user.types';

export interface AddressFormProps {
  user: User;
  onUpdateAction: (data: Partial<User>) => void;
}

export type AddressFormValues = z.infer<ReturnType<typeof addressFormSchema>>;

/**
 * Schema for the Address Form using zod.
 * Accepts a translation function for error messages.
 */
export const addressFormSchema = (t: (key: string) => string) =>
  z.object({
    street: z.string().min(1, { message: t('address.streetRequired') }),
    number: z.string().min(1, { message: t('address.numberRequired') }),
    complement: z.string().optional(),
    city: z.string().min(1, { message: t('address.cityRequired') }),
    state: z.string().min(1, { message: t('address.stateRequired') }),
    zipCode: z.string().min(1, { message: t('address.zipCodeRequired') }),
    country: z.string().min(1, { message: t('address.countryRequired') }),
  });
