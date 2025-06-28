import * as z from 'zod';

export const contactFormSchema = (t: {
  categoryRequired: string;
  messageTooShort: string;
}) =>
  z.object({
    category: z.string().min(1, { message: t.categoryRequired }),
    message: z.string().min(10, { message: t.messageTooShort }),
  });

export type ContactFormValues = z.infer<ReturnType<typeof contactFormSchema>>;
