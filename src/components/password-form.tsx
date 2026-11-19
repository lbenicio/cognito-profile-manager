'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useTranslations } from 'next-intl';
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
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { KeyRound, Loader2 } from 'lucide-react';
import React from 'react';
import { changePassword } from '@/actions/password.action';
import { passwordFormSchema } from '@/types/forms/password-form.types';
import type { PasswordFormValues } from '@/types/forms/password-form.types';

export function PasswordForm() {
  const { toast } = useToast();
  const t = useTranslations('Security.passwordForm');
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema(t)),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  });

  async function onSubmit(data: PasswordFormValues): Promise<void> {
    setIsSubmitting(true);

    const result = await changePassword(data.currentPassword, data.newPassword);

    if (result.success) {
      toast({
        title: t('successTitle'),
        description: t('successDescription'),
      });
      form.reset();
    } else {
      toast({
        variant: 'destructive',
        title: t('errorTitle'),
        description: result.message,
      });
      if (result.errorType === 'currentPassword') {
        form.setError('currentPassword', {
          type: 'manual',
          message: result.message,
        });
      } else if (result.errorType === 'newPassword') {
        form.setError('newPassword', {
          type: 'manual',
          message: result.message,
        });
      }
    }

    setIsSubmitting(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className='space-y-6'>
            <FormField
              control={form.control}
              name='currentPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('currentPasswordLabel')}</FormLabel>
                  <FormControl>
                    <Input type='password' placeholder='••••••••' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='newPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('newPasswordLabel')}</FormLabel>
                  <FormControl>
                    <Input type='password' placeholder='••••••••' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='confirmPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('confirmPasswordLabel')}</FormLabel>
                  <FormControl>
                    <Input type='password' placeholder='••••••••' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type='submit' disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className='animate-spin' />
              ) : (
                <KeyRound />
              )}
              <span className='ml-2'>{t('title')}</span>
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
