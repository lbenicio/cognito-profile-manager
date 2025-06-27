'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { User as UserType, PublicProfilePreferences } from '@/lib/auth';
import { PublicProfileDisplay } from './public-profile-display';
import { ProfileSettingsForm } from './profile-settings-form';

interface ProfileViewProps {
    user: UserType;
}

export function ProfileView({ user: initialUser }: ProfileViewProps) {
  const [user, setUser] = useState(initialUser);
  const t = useTranslations('Profile');

  const handleUpdate = (newPrefs: PublicProfilePreferences) => {
    setUser(currentUser => ({
      ...currentUser,
      publicProfilePreferences: newPrefs,
    }));
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
        <div>
          <PublicProfileDisplay user={user} />
        </div>
        <div>
          <ProfileSettingsForm 
            initialPreferences={user.publicProfilePreferences}
            onUpdate={handleUpdate}
          />
        </div>
      </div>
    </div>
  );
}
