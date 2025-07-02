import { getUser } from '@/lib/auth';
import { DashboardView } from '@/components/dashboard-view';
import { getTranslations } from 'next-intl/server';
import { syncPasskeysEnabledFlag } from '@/lib/passkey-actions';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { localLogout } from '@/lib/auth-actions';
import { MarkdownWidget } from '@/components/markdown-widget';
import type { User } from '@/types/user/user.types';

// Helper function to calculate security score
function calculateSecurityScore(user: User): number {
  let score = 0;
  if (user.email_verified) score += 25;
  if (user.phone_number_verified) score += 25;
  if (user.twoFactorEnabled) score += 25;
  if (user.passkeysEnabled) score += 25;
  return score;
}

// Helper function to calculate profile completion percentage
function calculateProfileCompletion(user: User): number {
  const fields = [
    user.picture,
    user.banner,
    user.aboutMe,
    user.address,
    user.phone_number,
    user.website,
  ];
  const completedFields = fields.filter(
    (field) => field && field.trim() !== ''
  ).length;
  return Math.round((completedFields / fields.length) * 100);
}

// This is now a Server Component
export default async function DashboardPage() {
  let user = await getUser();

  // Specifically load the namespaces we need for this page
  const tDashboard = await getTranslations('Dashboard');
  const tMessages = await getTranslations('Messages');
  const tHeader = await getTranslations('Header');

  // The middleware should protect this page. If user is null here, it indicates
  // a session issue that the middleware couldn't catch, or a failed API call in getUser.
  // We render an error instead of redirecting to prevent an infinite loop.
  if (!user) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <div className='space-y-4 text-center'>
          <h1 className='text-2xl font-bold'>Authentication Error</h1>
          <p className='text-muted-foreground'>
            Could not load user data. Please try logging out and signing in
            again.
          </p>
          <form action={localLogout}>
            <Button type='submit'>
              <LogOut className='mr-2 h-4 w-4' />
              {tHeader('userMenu.logout')}
            </Button>
          </form>
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

  // Assemble all translations needed by the client component
  const dashboardTranslations = {
    welcome: tDashboard('welcome', { name: user.name }),
    description: tDashboard('description'),
    id: tDashboard('id'),
    lastLogin: tDashboard('lastLogin'),
    verified: tDashboard('verified'),
    profileCard: {
      email: tDashboard('profileCard.email'),
      groups: tDashboard('profileCard.groups'),
      noGroups: tDashboard('profileCard.noGroups'),
    },
    editProfileButton: tDashboard('editProfileButton'),
    securityHealth: {
      title: tDashboard('securityHealth.title'),
      description: tDashboard('securityHealth.description'),
      score: tDashboard('securityHealth.score', {
        score: calculateSecurityScore(user),
      }),
      manageButton: tDashboard('securityHealth.manageButton'),
      checks: {
        email: tDashboard('securityHealth.checks.email'),
        phone: tDashboard('securityHealth.checks.phone'),
        twoFactor: tDashboard('securityHealth.checks.twoFactor'),
        passkeys: tDashboard('securityHealth.checks.passkeys'),
      },
    },
    profileCompletion: {
      title: tDashboard('profileCompletion.title'),
      description: tDashboard('profileCompletion.description'),
      percentage: tDashboard('profileCompletion.percentage', {
        percentage: calculateProfileCompletion(user),
      }),
      completeProfileButton: tDashboard(
        'profileCompletion.completeProfileButton'
      ),
      tasks: {
        picture: tDashboard('profileCompletion.tasks.picture'),
        banner: tDashboard('profileCompletion.tasks.banner'),
        aboutMe: tDashboard('profileCompletion.tasks.aboutMe'),
        address: tDashboard('profileCompletion.tasks.address'),
        phone: tDashboard('profileCompletion.tasks.phone'),
        website: tDashboard('profileCompletion.tasks.website'),
      },
    },
    quickActions: {
      title: tDashboard('quickActions.title'),
      description: tDashboard('quickActions.description'),
      changePassword: tDashboard('quickActions.changePassword'),
      manageSecurity: tDashboard('quickActions.manageSecurity'),
      appearanceSettings: tDashboard('quickActions.appearanceSettings'),
    },
    loginHistory: {
      title: tDashboard('loginHistory.title'),
      description: tDashboard('loginHistory.description'),
      date: tDashboard('loginHistory.date'),
      device: tDashboard('loginHistory.device'),
      ipAddress: tDashboard('loginHistory.ipAddress'),
      noHistory: tDashboard('loginHistory.noHistory'),
    },
    sessionInfo: {
      title: tDashboard('sessionInfo.title'),
      description: tDashboard('sessionInfo.description'),
      startedAt: tDashboard('sessionInfo.startedAt'),
      expiresIn: tDashboard('sessionInfo.expiresIn'),
      currentDevice: tDashboard('sessionInfo.currentDevice'),
      ipAddress: tDashboard('sessionInfo.ipAddress'),
      expired: tDashboard('sessionInfo.expired'),
    },
    messagesPreview: {
      title: tDashboard('messagesPreview.title'),
      description: tDashboard('messagesPreview.description'),
      noMessages: tDashboard('messagesPreview.noMessages'),
      viewAllButton: tDashboard('messagesPreview.viewAllButton'),
    },
    messages: {
      alertTitle: tMessages('alertTitle'),
    },
  };

  return (
    <DashboardView
      user={user}
      infoWidget={
        <MarkdownWidget
          filePath='src/content/dashboard-widget.md'
          title={tDashboard('dashboardInfo.title')}
        />
      }
      translations={dashboardTranslations}
    />
  );
}
