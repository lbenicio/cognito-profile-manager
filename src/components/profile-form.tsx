'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Save } from 'lucide-react';
import React from 'react';
import type { User as UserType } from '@/lib/auth';
import { TimezoneSelect } from './timezone-select';
import { PhoneInput } from './phone-input';

const profileFormSchema = (t: (key: string) => string) => z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }).max(50),
  address: z.string().min(10, { message: 'Please enter a full address.' }).max(100),
  phone_number: z.string().refine((phone) => /^\+[1-9]\d{7,14}$/.test(phone), {
    message: t('phoneInvalid'),
  }),
  website: z.string().url({ message: 'Please enter a valid URL.' }).or(z.literal('')).optional(),
  zoneinfo: z.string().max(50).optional(),
});

type ProfileFormValues = z.infer<ReturnType<typeof profileFormSchema>>;

interface ProfileFormProps {
    user: UserType;
    onUpdate: (data: Partial<UserType>) => void;
}

export function ProfileForm({ user, onUpdate }: ProfileFormProps) {
  const { toast } = useToast();
  const t = useTranslations('Profile.form');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema(t)),
    defaultValues: {
      name: user.name || '',
      address: user.address || '',
      phone_number: user.phone_number || '',
      website: user.website || '',
      zoneinfo: user.zoneinfo || '',
    },
    mode: 'onChange',
  });

  React.useEffect(() => {
    form.reset({
        name: user.name,
        address: user.address,
        phone_number: user.phone_number,
        website: user.website,
        zoneinfo: user.zoneinfo,
    });
  }, [user, form]);

  async function onSubmit(data: ProfileFormValues) {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    try {
        onUpdate(data);
        toast({
            title: t('successTitle'),
            description: t('successDescription'),
        });
    } catch (error) {
        toast({
            variant: 'destructive',
            title: t('errorTitle'),
            description: t('errorDescription'),
        });
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('nameLabel')}</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('addressLabel')}</FormLabel>
                  <FormControl>
                    <Input placeholder="123 Main St, Anytown, USA" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('phoneLabel')}</FormLabel>
                  <FormControl>
                    <PhoneInput {...field} />
                  </FormControl>
                  <FormDescription>
                    {t('phoneDescription')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('websiteLabel')}</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="zoneinfo"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{t('zoneinfoLabel')}</FormLabel>
                  <FormControl>
                    <TimezoneSelect 
                      value={field.value || ''} 
                      onChange={field.onChange} 
                    />
                  </FormControl>
                  <FormDescription>
                    {t('zoneinfoDescription')}
                  </FormDescription>
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
                <Save />
              )}
              <span className='ml-2'>{t('save')}</span>
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
