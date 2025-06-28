import { LoginView } from '@/components/login-view';
import { unstable_setRequestLocale } from 'next-intl/server';

// The login page is a client component to handle user interactions.
// We don't need to fetch any server-side data here.
export default async function LoginPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const params = await props.params;
  unstable_setRequestLocale(params.locale);
  return <LoginView />;
}
