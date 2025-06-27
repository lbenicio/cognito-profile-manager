import { getUser } from '@/lib/auth';
import { DashboardView } from '@/components/dashboard-view';
import { redirect } from '@/navigation';
import { unstable_setRequestLocale } from 'next-intl/server';

// This is now a Server Component
export default async function DashboardPage({params: {locale}}: {params: {locale: string}}) {
  // unstable_setRequestLocale is removed because this page is dynamic
  // due to fetching user data, which uses cookies().
  const user = await getUser();

  // This should not happen if middleware is correct, but as a safeguard
  if (!user) {
    redirect('/login');
  }

  return <DashboardView user={user} />;
}
