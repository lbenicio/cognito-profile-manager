import { getUser } from '@/lib/auth';
import { ProfileView } from '@/components/profile-view';

// This is now a Server Component that fetches data.
export default async function ProfilePage() {
  const user = await getUser();

  return <ProfileView initialUser={user} />;
}
