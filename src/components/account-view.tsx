'use client';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { AccountDisplay } from '@/components/account-display';
import { AccountForm } from '@/components/account-form';
import { PasswordForm } from '@/components/password-form';
import { TwoFactorAuth } from '@/components/two-factor-auth';
import type { User as UserType } from '@/lib/auth';
import { AddressForm } from './address-form';

interface AccountViewProps {
    initialUser: UserType;
}

export function AccountView({ initialUser }: AccountViewProps) {
  const [user, setUser] = useState(initialUser);
  const t = useTranslations('Account');

  useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);

  const handleProfileUpdate = (updatedData: Partial<UserType>) => {
    setUser((prevUser) => ({ ...prevUser, ...updatedData }));
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">
              {t('description')}
          </p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="flex flex-col gap-8">
          <AccountDisplay user={user} onUpdate={handleProfileUpdate} />
        </div>
        <div className="flex flex-col gap-8">
          <AccountForm user={user} onUpdate={handleProfileUpdate} />
          <AddressForm user={user} onUpdate={handleProfileUpdate} />
          <PasswordForm />
          <TwoFactorAuth user={user} onUpdate={handleProfileUpdate} />
        </div>
      </div>
    </div>
  );
}
