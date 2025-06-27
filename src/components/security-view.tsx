'use client';
import { useState, useEffect } from 'react';
import type { User as UserType } from '@/lib/auth';
import { PasswordForm } from '@/components/password-form';
import { TwoFactorAuth } from '@/components/two-factor-auth';
import { PasskeyManagement } from './passkey-management';

interface SecurityViewProps {
    initialUser: UserType;
    translations: {
        title: string;
        description: string;
    }
}

export function SecurityView({ initialUser, translations }: SecurityViewProps) {
  const [user, setUser] = useState(initialUser);

  useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);

  const handleProfileUpdate = (updatedData: Partial<UserType>) => {
    setUser((prevUser) => ({ ...prevUser, ...updatedData }));
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">{translations.title}</h1>
          <p className="text-muted-foreground">
              {translations.description}
          </p>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <PasswordForm />
          <div className="flex flex-col gap-8">
            <TwoFactorAuth user={user} onUpdate={handleProfileUpdate} />
            <PasskeyManagement user={user} />
          </div>
      </div>
    </div>
  );
}
