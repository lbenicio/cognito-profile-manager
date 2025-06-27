'use client';
import { useState, useEffect } from 'react';
import type { User as UserType } from '@/lib/auth';
import { PasswordForm } from '@/components/password-form';
import { TwoFactorAuth } from '@/components/two-factor-auth';

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
      <div className="max-w-2xl mx-auto flex flex-col gap-8">
          <PasswordForm />
          <TwoFactorAuth user={user} onUpdate={handleProfileUpdate} />
      </div>
    </div>
  );
}
