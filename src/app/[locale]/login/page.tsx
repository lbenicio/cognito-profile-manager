import { LoginView } from '@/components/login-view';
import { unstable_setRequestLocale } from 'next-intl/server';

// The login page is a client component to handle user interactions.
// We don't need to fetch any server-side data here.
export default function LoginPage({params: {locale}}: {params: {locale: string}}) {
    unstable_setRequestLocale(locale);
    return <LoginView />;
}
