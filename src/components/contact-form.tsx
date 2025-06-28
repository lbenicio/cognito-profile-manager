'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send } from 'lucide-react';
import React, { useMemo } from 'react';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { sendContactEmail } from '@/lib/contact-actions';
import { Label } from './ui/label';
import type { ContactFormProps } from '@/interfaces/components/contact-form.interfaces';
import {
  contactFormSchema,
  type ContactFormValues,
} from '@/types/forms/contact-form.types';

export function ContactForm({ user, translations }: ContactFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema(translations)),
    defaultValues: {
      category: '',
      message: '',
    },
    mode: 'onChange',
  });

  const categories = useMemo(
    () => [
      { value: 'general', label: translations.categories.general },
      { value: 'billing', label: translations.categories.billing },
      { value: 'technical', label: translations.categories.technical },
      { value: 'feedback', label: translations.categories.feedback },
    ],
    [translations]
  );

  async function onSubmit(data: ContactFormValues): Promise<void> {
    setIsSubmitting(true);

    try {
      const result = await sendContactEmail(data);

      if (result.success) {
        toast({
          title: translations.successTitle,
          description: translations.successDescription,
        });
        form.reset();
      } else {
        toast({
          variant: 'destructive',
          title: translations.errorTitle,
          description: result.message || translations.errorDescription,
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: translations.errorTitle,
        description: translations.errorDescription,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className='mx-auto max-w-2xl'>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className='space-y-6 pt-6'>
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <div className='space-y-2'>
                <Label htmlFor='name'>{translations.nameLabel}</Label>
                <Input id='name' value={user.name} readOnly disabled />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='email'>{translations.emailLabel}</Label>
                <Input id='email' value={user.email} readOnly disabled />
              </div>
            </div>

            <FormField
              control={form.control}
              name='category'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{translations.categoryLabel}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={translations.categoryPlaceholder}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='message'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{translations.messageLabel}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={translations.messagePlaceholder}
                      className='min-h-[150px] resize-y'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type='submit' disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className='animate-spin' /> : <Send />}
              <span className='ml-2'>{translations.submitButton}</span>
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
