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
import { updateUserProfile } from '@/lib/profile-actions';
import { TimezoneSelect } from './timezone-select';
import { PhoneInput } from './phone-input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const accountFormSchema = (t: (key: string) => string) => z.object({
  given_name: z.string().min(1, { message: t('givenNameRequired') }).max(50),
  family_name: z.string().min(1, { message: t('familyNameRequired') }).max(50),
  streetAddress: z.string().min(1, { message: t('streetAddressRequired') }),
  city: z.string().min(1, { message: t('cityRequired') }),
  state: z.string().min(1, { message: t('stateRequired') }),
  zipCode: z.string().min(1, { message: t('zipCodeRequired') }),
  country: z.string().min(1, { message: t('countryRequired') }),
  phone_number: z.string().refine((phone) => /^\+[1-9]\d{7,14}$/.test(phone), {
    message: t('phoneInvalid'),
  }),
  website: z.string().url({ message: 'Please enter a valid URL.' }).or(z.literal('')).optional(),
  zoneinfo: z.string().max(50).optional(),
  gender: z.string().optional(),
  aboutMe: z.string().max(250, { message: t('aboutMeTooLong') }).optional(),
});

type AccountFormValues = z.infer<ReturnType<typeof accountFormSchema>>;

interface AccountFormProps {
    user: UserType;
    onUpdate: (data: Partial<UserType>) => void;
}

export function AccountForm({ user, onUpdate }: AccountFormProps) {
  const { toast } = useToast();
  const t = useTranslations('Account.form');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema(t)),
    defaultValues: {
      given_name: '',
      family_name: '',
      streetAddress: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      phone_number: user.phone_number || '',
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
        streetAddress: '', // Keep address fields blank for new entry
        city: '',
        state: '',
        zipCode: '',
        country: '',
        phone_number: user.phone_number,
        website: user.website,
        zoneinfo: user.zoneinfo,
        gender: user.gender,
        aboutMe: user.aboutMe,
    });
  }, [user, form]);

  async function onSubmit(data: AccountFormValues) {
    setIsSubmitting(true);
    
    try {
        const fullAddress = `${data.streetAddress}, ${data.city}, ${data.state} ${data.zipCode}, ${data.country}`;
        const result = await updateUserProfile({
            ...data,
            address: fullAddress,
            website: data.website || '',
            zoneinfo: data.zoneinfo || '',
            gender: data.gender || '',
            aboutMe: data.aboutMe || '',
        });

        if (result.success) {
            onUpdate({
                name: `${data.given_name} ${data.family_name}`.trim(),
                address: fullAddress,
                phone_number: data.phone_number,
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
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="given_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('givenNameLabel')}</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="family_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('familyNameLabel')}</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
            <FormField
              control={form.control}
              name="aboutMe"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('aboutMeLabel')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('aboutMePlaceholder')}
                      className="resize-none"
                      rows={5}
                      {...field}
                    />
                  </FormControl>
                   <FormDescription>
                    {t('aboutMeDescription')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-2">
                <FormLabel>{t('address.label')}</FormLabel>
                <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="streetAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder={t('address.streetPlaceholder')} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input placeholder={t('address.cityPlaceholder')} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="state"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input placeholder={t('address.statePlaceholder')} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="zipCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input placeholder={t('address.zipCodePlaceholder')} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="country"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input placeholder={t('address.countryPlaceholder')} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                    </div>
                </div>
            </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('phoneLabel')}</FormLabel>
                      <FormControl>
                        <PhoneInput {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('genderLabel')}</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('genderPlaceholder')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Male">{t('genderMale')}</SelectItem>
                          <SelectItem value="Female">{t('genderFemale')}</SelectItem>
                          <SelectItem value="Prefer not to say">{t('genderPreferNotToSay')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
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
