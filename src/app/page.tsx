'use client';
import { useState } from 'react';
import { ProfileDisplay } from '@/components/profile-display';
import { ProfileForm } from '@/components/profile-form';
import { PasswordForm } from '@/components/password-form';
import { Verification } from '@/components/verification';

// Mock user data as we don't have a real backend
const initialUser = {
  username: 'testuser',
  email: 'test@example.com',
  email_verified: true,
  name: 'Test User',
  address: '123 Main St, Anytown, USA',
  phone_number: '+15551234567',
  phone_number_verified: false,
};

export default function Home() {
  const [user, setUser] = useState(initialUser);

  const handleProfileUpdate = (updatedData: Partial<typeof initialUser>) => {
    setUser((prevUser) => ({ ...prevUser, ...updatedData }));
  };

  return (
    <main className="container mx-auto p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-headline font-bold text-primary">Cognito Profile Manager</h1>
        <p className="text-muted-foreground mt-2">View and manage your profile settings.</p>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 flex flex-col gap-8">
          <ProfileDisplay user={user} />
          <Verification user={user} />
        </div>
        <div className="lg:col-span-2 flex flex-col gap-8">
          <ProfileForm user={user} onUpdate={handleProfileUpdate} />
          <PasswordForm />
        </div>
      </div>
    </main>
  );
}
