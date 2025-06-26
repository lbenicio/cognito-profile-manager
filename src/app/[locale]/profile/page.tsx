import { getUser } from '@/lib/auth';
import { ProfileView } from '@/components/profile-view';
import { redirect } from '@/navigation';

// This is a protected Server Component that fetches data.
// The middleware ensures only authenticated users can access it.
export default async function ProfilePage() {
  const user = await getUser();

  // This check is a safeguard.
  if (!user) {
    redirect('/login');
  }

  return <ProfileView initialUser={user} />;
}
