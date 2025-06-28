import { getUser } from '@/lib/auth';
import { ProfileView } from '@/components/profile-view';
import { unstable_setRequestLocale } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export default async function ProfilePage(props: {
  params: Promise<{ locale: string }>;
}) {
  const params = await props.params;
  unstable_setRequestLocale(params.locale);
  const user = await getUser();

  if (!user) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <div className='space-y-4 text-center'>
          <h1 className='text-2xl font-bold'>Authentication Error</h1>
          <p className='text-muted-foreground'>
            Could not load user data. Please try logging out and signing in
            again.
          </p>
          <Button asChild>
            <a href='/api/v1/auth/logout'>
              <LogOut className='mr-2 h-4 w-4' />
              Log Out
            </a>
          </Button>
        </div>
      </div>
    );
  }

  return <ProfileView user={user} />;
}
