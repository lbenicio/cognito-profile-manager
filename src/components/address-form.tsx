'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
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
import { Loader2, Save } from 'lucide-react';
import React from 'react';
import { updateUserAddress } from '@/lib/actions/profile.action';
import { addressFormSchema } from '@/types/forms/address-form.types';
import {
  AddressFormProps,
  AddressFormValues,
} from '@/interfaces/forms/address-form.interfaces';

export function AddressForm({ user, onUpdateAction }: AddressFormProps) {
  const { toast } = useToast();
  const t = useTranslations('Account.form');
  const tAddress = useTranslations('Account.addressForm');
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressFormSchema(t)),
    defaultValues: {
      street: '',
      number: '',
      complement: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
    mode: 'onChange',
  });

  async function onSubmit(data: AddressFormValues): Promise<void> {
    setIsSubmitting(true);

    try {
      const complementPart = data.complement ? `, ${data.complement}` : '';
      const fullAddress = `${data.street} ${data.number}${complementPart}, ${data.city}, ${data.state} ${data.zipCode}, ${data.country}`;

      const result = await updateUserAddress(fullAddress);

      if (result.success) {
        onUpdateAction({ address: fullAddress });
        toast({
          title: tAddress('successTitle'),
          description: tAddress('successDescription'),
        });
        form.reset();
      } else {
        toast({
          variant: 'destructive',
          title: tAddress('errorTitle'),
          description: result.message,
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: tAddress('errorTitle'),
        description: tAddress('errorDescription'),
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{tAddress('title')}</CardTitle>
        <CardDescription>{tAddress('description')}</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className='space-y-4'>
            <FormField
              control={form.control}
              name='street'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('address.streetLabel')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('address.streetPlaceholder')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <FormField
                control={form.control}
                name='number'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('address.numberLabel')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('address.numberPlaceholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='complement'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('address.complementLabel')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('address.complementPlaceholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <FormField
                control={form.control}
                name='city'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('address.cityLabel')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('address.cityPlaceholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='state'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('address.stateLabel')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('address.statePlaceholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <FormField
                control={form.control}
                name='zipCode'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('address.zipCodeLabel')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('address.zipCodePlaceholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='country'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('address.countryLabel')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('address.countryPlaceholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
