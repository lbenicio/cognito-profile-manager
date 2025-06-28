'use client';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { AccountDisplay } from '@/components/account-display';
import { AccountForm } from '@/components/account-form';
import { AddressForm } from './address-form';
import type { AccountViewProps } from '@/interfaces/components/account-view.interfaces';
import type { User } from '@/types/user/user.types';

export function AccountView({ initialUser }: AccountViewProps) {
  const [user, setUser] = useState<User>(initialUser);
  const t = useTranslations('Account');

  useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);

  const handleProfileUpdate = (updatedData: Partial<User>): void => {
    setUser((prevUser) => ({ ...prevUser, ...updatedData }));
  };

  return (
    <div className='container mx-auto p-4 md:p-8'>
      <header className='mb-8'>
        <h1 className='text-3xl font-bold tracking-tight'>{t('title')}</h1>
        <p className='text-muted-foreground'>{t('description')}</p>
      </header>
      <div className='grid grid-cols-1 items-start gap-8 md:grid-cols-2'>
        <div className='flex flex-col gap-8'>
          <AccountDisplay user={user} onUpdateAction={handleProfileUpdate} />
        </div>
        <div className='flex flex-col gap-8'>
          <AccountForm user={user} onUpdateAction={handleProfileUpdate} />
          <AddressForm user={user} onUpdateAction={handleProfileUpdate} />
        </div>
      </div>
    </div>
  );
}
