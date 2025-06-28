
import { getUser } from '@/lib/auth';
import { DashboardView } from '@/components/dashboard-view';
import { unstable_setRequestLocale } from 'next-intl/server';
import { syncPasskeysEnabledFlag } from '@/lib/passkey-actions';

// This is now a Server Component
export default async function DashboardPage(props: {params: {locale: string}}) {
    unstable_setRequestLocale(props.params.locale);
    let user = await getUser();

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

    // If user has passkeys but the flag is not enabled, sync it.
    if (user.devices.length >= 1 && !user.passkeysEnabled) {
      await syncPasskeysEnabledFlag();
      // Manually update the user object for this render to be consistent.
      // Revalidation will handle future requests.
      user = { ...user, passkeysEnabled: true };
    }

    return <DashboardView user={user} />;
}
