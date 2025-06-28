import { LoginView } from '@/components/login-view';
import { unstable_setRequestLocale } from 'next-intl/server';
import type { LoginPageProps } from '@/interfaces/app/page-props.interfaces';

export default async function LoginPage({
  params,
}: LoginPageProps): Promise<JSX.Element> {
  unstable_setRequestLocale(params.locale);
  return <LoginView />;
}
