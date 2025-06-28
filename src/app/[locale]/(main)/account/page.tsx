import { getUser } from '@/lib/auth';
import { AccountView } from '@/components/account-view';
import { unstable_setRequestLocale } from 'next-intl/server';

export default async function AccountPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const params = await props.params;
  unstable_setRequestLocale(params.locale);
  const user = await getUser();

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

  return <AccountView initialUser={user} />;
}
