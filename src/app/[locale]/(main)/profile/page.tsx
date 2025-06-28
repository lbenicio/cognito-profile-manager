import { getUser } from '@/lib/auth';
import { ProfileView } from '@/components/profile-view';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { localLogout } from '@/lib/auth-actions';

export default async function ProfilePage(props: {
  params: Promise<{ locale: string }>;
}) {
  const params = await props.params;
  setRequestLocale(params.locale);
  const user = await getUser();

  if (!user) {
    const t = await getTranslations('Header');
    return (
      <div className='flex h-screen items-center justify-center'>
        <div className='space-y-4 text-center'>
          <h1 className='text-2xl font-bold'>Authentication Error</h1>
          <p className='text-muted-foreground'>
            Could not load user data. Please try logging out and signing in
            again.
          </p>
          <form action={localLogout}>
            <Button type='submit'>
              <LogOut className='mr-2 h-4 w-4' />
              {t('userMenu.logout')}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return <ProfileView user={user} />;
}
