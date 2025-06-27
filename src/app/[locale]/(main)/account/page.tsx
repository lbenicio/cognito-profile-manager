import { getUser } from '@/lib/auth';
import { AccountView } from '@/components/account-view';
import { redirect } from '@/navigation';
import { unstable_setRequestLocale } from 'next-intl/server';

export default async function AccountPage({params: {locale}}: {params: {locale: string}}) {
  unstable_setRequestLocale(locale);
  const user = await getUser();

  if (!user) {
    redirect('/login');
  }

  return <AccountView initialUser={user} />;
}
