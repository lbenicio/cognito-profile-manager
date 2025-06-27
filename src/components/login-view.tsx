'use client';

import { useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { devAdminLogin } from '@/lib/auth-actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, LogIn } from 'lucide-react';

export function LoginView() {
    const t = useTranslations('Login');
    const searchParams = useSearchParams();
    const error = searchParams.get('error');
    const [isSsoPending, startSsoTransition] = useTransition();
    const [isAdminPending, startAdminTransition] = useTransition();

    const handleSsoLogin = () => {
        startSsoTransition(() => {
            window.location.href = '/api/v1/auth/sso/start';
        });
    };

    const handleAdminLogin = () => {
        startAdminTransition(() => {
            devAdminLogin();
        });
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <Card className="w-full max-w-md mx-4">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">{t('title')}</CardTitle>
                    <CardDescription>{t('description')}</CardDescription>
                </CardHeader>
                <CardContent>
                    {error && (
                        <Alert variant="destructive" className="mb-6">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>{t('errorTitle')}</AlertTitle>
                            <AlertDescription>
                                {error === 'invalid_state' ? t('invalid_state') : error}
                            </AlertDescription>
                        </Alert>
                    )}
                    <div className="space-y-4">
                        <Button onClick={handleSsoLogin} disabled={isSsoPending} className="w-full">
                            {isSsoPending ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
                            ) : (
                                <LogIn />
                            )}
                            <span className="ml-2">{t('signInButton')}</span>
                        </Button>

                        {process.env.NODE_ENV === 'development' && (
                             <Button
                                onClick={handleAdminLogin}
                                disabled={isAdminPending}
                                className="w-full"
                                variant="secondary"
                            >
                                {isAdminPending ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
                                ) : (
                                    <LogIn />
                                )}
                                <span className="ml-2">{t('signInAdminButton')}</span>
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
