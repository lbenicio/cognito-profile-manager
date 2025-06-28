'use client';
import { useState, useEffect } from 'react';
import { PasswordForm } from '@/components/password-form';
import { TwoFactorAuth } from '@/components/two-factor-auth';
import { PasskeyManagement } from './passkey-management';
import type { User } from '@/types/user/user.types';
import type { SecurityViewProps } from '@/interfaces/components/security-view.interfaces';

export function SecurityView({ initialUser, translations }: SecurityViewProps) {
  const [user, setUser] = useState<User>(initialUser);

  useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);

  const handleProfileUpdate = (updatedData: Partial<User>): void => {
    setUser((prevUser) => ({ ...prevUser, ...updatedData }));
  };

  return (
    <div className='container mx-auto p-4 md:p-8'>
      <header className='mb-8'>
        <h1 className='text-3xl font-bold tracking-tight'>
          {translations.title}
        </h1>
        <p className='text-muted-foreground'>{translations.description}</p>
      </header>
      <div className='grid grid-cols-1 items-start gap-8 lg:grid-cols-2'>
        <PasswordForm />
        <div className='flex flex-col gap-8'>
          <TwoFactorAuth user={user} onUpdate={handleProfileUpdate} />
          <PasskeyManagement user={user} />
        </div>
      </div>
    </div>
  );
}
