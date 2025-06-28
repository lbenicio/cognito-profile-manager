import type { User } from '@/types/user/user.types';
import type * as z from 'zod';

export type ContactFormValues = {
  category: string;
  message: string;
};

export interface ContactFormProps {
  user: User;
  translations: {
    nameLabel: string;
    emailLabel: string;
    categoryLabel: string;
    categoryPlaceholder: string;
    messageLabel: string;
    messagePlaceholder: string;
    submitButton: string;
    successTitle: string;
    successDescription: string;
    errorTitle: string;
    errorDescription: string;
    categoryRequired: string;
    messageRequired: string;
    messageTooShort: string;
    categories: {
      general: string;
      billing: string;
      technical: string;
      feedback: string;
    };
  };
}
