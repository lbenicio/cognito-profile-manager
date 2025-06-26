import { getUser } from '@/lib/auth';
import { DashboardView } from '@/components/dashboard-view';

// This is now a Server Component
export default async function DashboardPage() {
  const user = await getUser();

  return <DashboardView user={user} />;
}
