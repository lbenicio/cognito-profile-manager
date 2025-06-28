'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { devAdminLogin, ssoLogin } from '@/lib/auth-actions';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { LogIn } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function LoginView() {
  const t = useTranslations('Login');
  const searchParams = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    if (error) {
      toast({
        variant: 'destructive',
        title: t('errorTitle'),
        description:
          errorDescription ||
          (error === 'invalid_state'
            ? t('invalid_state')
            : t('errorDescription')),
      });
      // Clean the URL to prevent the toast from re-appearing on refresh.
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [searchParams, t, toast]);

  return (
    <div className='flex min-h-screen items-center justify-center bg-background'>
      <Card className='mx-4 w-full max-w-md'>
        <CardHeader className='text-center'>
          <CardTitle className='text-2xl'>{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <form action={ssoLogin}>
              <Button type='submit' className='w-full'>
                <LogIn />
                <span className='ml-2'>{t('signInButton')}</span>
              </Button>
            </form>

            {process.env.NODE_ENV === 'development' && (
              <form action={devAdminLogin}>
                <Button type='submit' className='w-full' variant='secondary'>
                  <LogIn />
                  <span className='ml-2'>{t('signInAdminButton')}</span>
                </Button>
              </form>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
