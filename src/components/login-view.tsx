'use client';

import { useTransition, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { devAdminLogin } from '@/lib/auth-actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function LoginView() {
    const t = useTranslations('Login');
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const [isSsoPending, startSsoTransition] = useTransition();
    const [isAdminPending, startAdminTransition] = useTransition();

    useEffect(() => {
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        if (error) {
            toast({
                variant: 'destructive',
                title: t('errorTitle'),
                description: errorDescription || (error === 'invalid_state' ? t('invalid_state') : error),
            });
            // Clean the URL to prevent the toast from re-appearing on refresh.
            window.history.replaceState(null, '', window.location.pathname);
        }
    }, [searchParams, t, toast]);

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
