import { getUser } from '@/lib/auth';
import { DashboardView } from '@/components/dashboard-view';
import { unstable_setRequestLocale } from 'next-intl/server';

// This is now a Server Component
export default async function DashboardPage({params}: {params: {locale: string}}) {
  unstable_setRequestLocale(params.locale);
  const user = await getUser();

  // The middleware should protect this page. If user is null here, it indicates
  // a session issue that the middleware couldn't catch, or a failed API call in getUser.
  // We render an error instead of redirecting to prevent an infinite loop.
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

  return <DashboardView user={user} />;
}
