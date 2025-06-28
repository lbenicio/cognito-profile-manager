import { getUser } from '@/lib/auth';
import { SecurityView } from '@/components/security-view';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { syncPasskeysEnabledFlag } from '@/lib/passkey-actions';

export default async function SecurityPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { params } = props;
  unstable_setRequestLocale(params.locale);
  let user = await getUser();

  if (!user) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold'>Authentication Error</h1>
          <p className='text-muted-foreground'>
            Could not load user data. Please try logging out and signing in
            again.
          </p>
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

  const t = await getTranslations('Security');

  const securityPageTranslations = {
    title: t('title'),
    description: t('description'),
  };

  return (
    <SecurityView initialUser={user} translations={securityPageTranslations} />
  );
}
