import { getUser } from '@/lib/auth';
import { DashboardView } from '@/components/dashboard-view';
import { redirect } from '@/navigation';
import { unstable_setRequestLocale } from 'next-intl/server';

// This is now a Server Component
export default async function DashboardPage({params: {locale}}: {params: {locale: string}}) {
  unstable_setRequestLocale(locale);
  const user = await getUser();

  // This should not happen if middleware is correct, but as a safeguard
  if (!user) {
    redirect('/login');
  }

  return <DashboardView user={user} />;
}
