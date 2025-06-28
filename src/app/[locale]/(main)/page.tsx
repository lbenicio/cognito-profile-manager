import type { User } from '@/types/user/user.types';
import type { DashboardPageProps } from '@/interfaces/app/page-props.interfaces';
import { getUser } from '@/lib/auth';
import { DashboardView } from '@/components/dashboard-view';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { syncPasskeysEnabledFlag } from '@/lib/passkey-actions';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { localLogout } from '@/lib/auth-actions';

export default async function DashboardPage({
  params,
}: DashboardPageProps): Promise<JSX.Element> {
  unstable_setRequestLocale(params.locale);
  let user: User | null = await getUser();

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

  // If user has passkeys but the flag is not enabled, sync it.
  if (user.devices.length >= 1 && !user.passkeysEnabled) {
    await syncPasskeysEnabledFlag();
    // Manually update the user object for this render to be consistent.
    // Revalidation will handle future requests.
    user = { ...user, passkeysEnabled: true };
  }

  return <DashboardView user={user} />;
}
