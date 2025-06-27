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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { KeyRound } from 'lucide-react';
import React from 'react';
import { changePassword } from '@/lib/password-actions';

const passwordFormSchema = (t: (key: string) => string) => z.object({
    currentPassword: z.string().min(1, { message: "Current password is required." }),
    newPassword: z.string().min(8, { message: "Password must be at least 8 characters." }),
    confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
    message: t('passwordMismatch'),
    path: ["confirmPassword"]
});

type PasswordFormValues = z.infer<ReturnType<typeof passwordFormSchema>>;

export function PasswordForm() {
  const { toast } = useToast();
  const t = useTranslations('Profile.passwordForm');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema(t)),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    mode: 'onChange'
  });

  async function onSubmit(data: PasswordFormValues) {
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
            form.setError("currentPassword", { type: "manual", message: result.message });
        } else if (result.errorType === 'newPassword') {
            form.setError("newPassword", { type: "manual", message: result.message });
        }
    }
    
    setIsSubmitting(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>
          {t('description')}
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('currentPasswordLabel')}</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('newPasswordLabel')}</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('confirmPasswordLabel')}</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting}>
               {isSubmitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
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
