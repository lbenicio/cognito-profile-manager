import { getUser } from '@/lib/auth';
import { DashboardView } from '@/components/dashboard-view';
import { redirect } from '@/navigation';

// This is now a Server Component
export default async function DashboardPage() {
  const user = await getUser();

  // This should not happen if middleware is correct, but as a safeguard
  if (!user) {
    redirect('/login');
  }

  return <DashboardView user={user} />;
}