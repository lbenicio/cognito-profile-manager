import { getUser } from '@/lib/auth';
import { DashboardView } from '@/components/dashboard-view';
import { redirect } from '@/navigation';

// This is a protected Server Component.
// The middleware ensures only authenticated users can access it.
export default async function DashboardPage() {
  const user = await getUser();

  // This check is a safeguard, as middleware should handle redirection.
  if (!user) {
    redirect('/login');
  }

  return <DashboardView user={user} />;
}
