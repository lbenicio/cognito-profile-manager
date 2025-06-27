import { getUser } from '@/lib/auth';
import { ProfileView } from '@/components/profile-view';
import { redirect } from '@/navigation';
import { unstable_setRequestLocale } from 'next-intl/server';

// This is now a Server Component that fetches data.
export default async function ProfilePage({params: {locale}}: {params: {locale: string}}) {
  // unstable_setRequestLocale is removed because this page is dynamic
  // due to fetching user data, which uses cookies().
  const user = await getUser();

  if (!user) {
    redirect('/login');
  }

  return <ProfileView initialUser={user} />;
}
