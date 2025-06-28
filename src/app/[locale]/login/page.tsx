import { LoginView } from '@/components/login-view';
import { unstable_setRequestLocale } from 'next-intl/server';

interface LoginPageProps {
  params: {
    locale: string;
  };
}

export default async function LoginPage({
  params,
}: LoginPageProps): Promise<JSX.Element> {
  unstable_setRequestLocale(params.locale);
  return <LoginView />;
}
