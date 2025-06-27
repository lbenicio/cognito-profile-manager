import { getUser } from '@/lib/auth';
import { ProfileView } from '@/components/profile-view';
import { redirect } from '@/navigation';
import { unstable_setRequestLocale } from 'next-intl/server';

export default async function ProfilePage({params: {locale}}: {params: {locale: string}}) {
  unstable_setRequestLocale(locale);
  const user = await getUser();

  if (!user) {
    redirect('/login');
  }

  return <ProfileView user={user} />;
}
