import { getUser } from '@/lib/auth';
import { ProfileView } from '@/components/profile-view';
import { redirect } from '@/navigation';

// This is now a Server Component that fetches data.
export default async function ProfilePage() {
  const user = await getUser();

  if (!user) {
    redirect('/login');
  }

  return <ProfileView initialUser={user} />;
}
