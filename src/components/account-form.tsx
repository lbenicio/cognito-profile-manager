'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';
import React from 'react';
import { updateUserProfile } from '@/actions/profile.action';
import { TimezoneSelect } from './timezone-select';
import { PhoneInput } from './phone-input';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { DatePicker } from './ui/date-picker';
import { format } from 'date-fns';
import { accountFormSchema } from '@/types/forms/account-form.types';
import type {
  AccountFormProps,
  AccountFormValues,
} from '@/types/forms/account-form.types';

export function AccountForm({ user, onUpdateAction }: AccountFormProps) {
  const { toast } = useToast();
  const t = useTranslations('Account.form');
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema(t)),
    defaultValues: {
      given_name: '',
      family_name: '',
      phone_number: user.phone_number || '',
      birthdate: user.birthdate ? new Date(user.birthdate) : undefined,
      website: user.website || '',
      zoneinfo: user.zoneinfo || '',
      gender: user.gender || '',
      aboutMe: user.aboutMe || '',
    },
    mode: 'onChange',
  });

  React.useEffect(() => {
    const nameParts = user.name?.split(' ') || [''];
    const given_name = nameParts[0] || '';
    const family_name = nameParts.slice(1).join(' ');

    form.reset({
      given_name,
      family_name,
      phone_number: user.phone_number,
      birthdate: user.birthdate ? new Date(user.birthdate) : undefined,
      website: user.website,
      zoneinfo: user.zoneinfo,
      gender: user.gender,
      aboutMe: user.aboutMe,
    });
  }, [user, form]);

  async function onSubmit(data: AccountFormValues): Promise<void> {
    setIsSubmitting(true);

    try {
      const result = await updateUserProfile({
        ...data,
        birthdate: data.birthdate ? format(data.birthdate, 'yyyy-MM-dd') : '',
        website: data.website || '',
        zoneinfo: data.zoneinfo || '',
        gender: data.gender || '',
        aboutMe: data.aboutMe || '',
      });

      if (result.success) {
        onUpdateAction({
          name: `${data.given_name} ${data.family_name}`.trim(),
          phone_number: data.phone_number,
          birthdate: data.birthdate ? format(data.birthdate, 'yyyy-MM-dd') : '',
          website: data.website,
          zoneinfo: data.zoneinfo,
          gender: data.gender,
          aboutMe: data.aboutMe,
        });
        toast({
          title: t('successTitle'),
          description: t('successDescription'),
        });
      } else {
        toast({
          variant: 'destructive',
          title: t('errorTitle'),
          description: result.message,
        });
      }
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
          <CardContent className='space-y-6'>
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <FormField
                control={form.control}
                name='given_name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('givenNameLabel')}</FormLabel>
                    <FormControl>
                      <Input placeholder='John' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='family_name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('familyNameLabel')}</FormLabel>
                    <FormControl>
                      <Input placeholder='Doe' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name='aboutMe'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('aboutMeLabel')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('aboutMePlaceholder')}
                      className='resize-none'
                      rows={10}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>{t('aboutMeDescription')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <FormField
                control={form.control}
                name='phone_number'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('phoneLabel')}</FormLabel>
                    <FormControl>
                      <PhoneInput {...field} onChangeAction={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='gender'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('genderLabel')}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('genderPlaceholder')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='Male'>{t('genderMale')}</SelectItem>
                        <SelectItem value='Female'>
                          {t('genderFemale')}
                        </SelectItem>
                        <SelectItem value='Prefer not to say'>
                          {t('genderPreferNotToSay')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name='birthdate'
              render={({ field }) => (
                <FormItem className='flex flex-col'>
                  <FormLabel>{t('birthdateLabel')}</FormLabel>
                  <FormControl>
                    <DatePicker
                      value={field.value}
                      onChangeAction={field.onChange}
                      placeholder={t('birthdatePlaceholder')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='website'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('websiteLabel')}</FormLabel>
                  <FormControl>
                    <Input placeholder='https://example.com' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='zoneinfo'
              render={({ field }) => (
                <FormItem className='flex flex-col'>
                  <FormLabel>{t('zoneinfoLabel')}</FormLabel>
                  <FormControl>
                    <TimezoneSelect
                      value={field.value || ''}
                      onChangeAction={field.onChange}
                    />
                  </FormControl>
                  <FormDescription>{t('zoneinfoDescription')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type='submit' disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className='animate-spin' /> : <Save />}
              <span className='ml-2'>{t('save')}</span>
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
