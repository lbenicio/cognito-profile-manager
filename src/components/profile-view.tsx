'use client';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { ProfileDisplay } from '@/components/profile-display';
import { ProfileForm } from '@/components/profile-form';
import { PasswordForm } from '@/components/password-form';
import { TwoFactorAuth } from '@/components/two-factor-auth';
import type { User as UserType } from '@/lib/auth';

interface ProfileViewProps {
    initialUser: UserType;
}

export function ProfileView({ initialUser }: ProfileViewProps) {
  const [user, setUser] = useState(initialUser);
  const t = useTranslations('Profile');

  // Syncs the component's internal state when the `initialUser` prop changes.
  // This is crucial for reflecting updates after a server data refresh (e.g., via router.refresh()).
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 flex flex-col gap-8">
          <ProfileDisplay user={user} onUpdate={handleProfileUpdate} />
        </div>
        <div className="lg:col-span-2 flex flex-col gap-8">
          <ProfileForm user={user} onUpdate={handleProfileUpdate} />
          <PasswordForm />
          <TwoFactorAuth user={user} onUpdate={handleProfileUpdate} />
        </div>
      </div>
    </div>
  );
}
