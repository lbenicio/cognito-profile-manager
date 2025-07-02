import { getUser } from '@/lib/auth';
import { SecurityView } from '@/components/security-view';
import { getTranslations } from 'next-intl/server';
import { syncPasskeysEnabledFlag } from '@/actions/passkey.action';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { localLogout } from '@/actions/auth.action';

export default async function SecurityPage() {
  let user = await getUser();
  const t = await getTranslations();

  if (!user) {
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
              {t('Header.userMenu.logout')}
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

  const securityPageTranslations = {
    title: t('Security.title'),
    description: t('Security.description'),
  };

  return (
    <SecurityView initialUser={user} translations={securityPageTranslations} />
  );
}
