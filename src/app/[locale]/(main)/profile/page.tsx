import { getUser } from '@/lib/auth';
import { ProfileView } from '@/components/profile-view';
import { unstable_setRequestLocale } from 'next-intl/server';

export default async function ProfilePage({params}: {params: {locale: string}}) {
  unstable_setRequestLocale(params.locale);
  const user = await getUser();

  if (!user) {
     return (
        <div className="flex items-center justify-center h-screen">
            <div className="text-center">
                <h1 className="text-2xl font-bold">Authentication Error</h1>
                <p className="text-muted-foreground">Could not load user data. Please try logging out and signing in again.</p>
            </div>
        </div>
    );
  }

  return <ProfileView user={user} />;
}
