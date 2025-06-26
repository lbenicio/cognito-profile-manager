'use client';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ssoLogin, devAdminLogin } from '@/lib/auth-actions';
import { useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { Shield, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

function SsoSubmitButton() {
    const [isPending, startTransition] = useTransition();
    const t = useTranslations('Login');

    const handleLogin = () => {
      startTransition(() => {
        ssoLogin();
      });
    };

    return (
        <Button type="button" onClick={handleLogin} className="w-full" disabled={isPending}>
            {isPending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
            ) : (
                <Shield className="mr-2 h-4 w-4" />
            )}
            {t('signInButton')}
        </Button>
    )
}

function AdminSubmitButton() {
    const [isPending, startTransition] = useTransition();
    const t = useTranslations('Login');

    const handleLogin = () => {
      startTransition(() => {
        devAdminLogin();
      });
    };

    return (
        <Button type="button" onClick={handleLogin} variant="secondary" className="w-full" disabled={isPending}>
            <Shield className="mr-2 h-4 w-4" />
            {t('signInAdminButton')}
        </Button>
    )
}

export default function LoginPage() {
  const t = useTranslations('Login');
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return (
    <div className="flex flex-col flex-1 items-center justify-center p-4">
        <Card className="w-full max-w-sm">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl">{t('title')}</CardTitle>
                <CardDescription>{t('description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                 {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>{t('errorTitle')}</AlertTitle>
                        <AlertDescription>{t('errorDescription')}</AlertDescription>
                    </Alert>
                )}
                <SsoSubmitButton />
                {process.env.NODE_ENV === 'development' && <AdminSubmitButton />}
              </div>
            </CardContent>
        </Card>
    </div>
  );
}
