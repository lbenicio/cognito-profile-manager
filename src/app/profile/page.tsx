import { getUser } from '@/lib/auth';
import { ProfileView } from '@/components/profile-view';

// This is a Server Component that fetches data.
// Note: This page is likely unused due to the i18n routing,
// but it needs to be a valid component to prevent build errors.
export default async function ProfilePage() {
  const user = await getUser();

  return <ProfileView initialUser={user} />;
}
