'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { devAdminLogin, devUserLogin, ssoLogin } from '@/lib/actions/auth.action';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2, LogIn, Shield, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface LoginViewProps {}

export function LoginView({}: LoginViewProps) {
  const t = useTranslations('Login');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isSsoLoading, setIsSsoLoading] = useState<boolean>(false);
  const [isAdminLoading, setIsAdminLoading] = useState<boolean>(false);
  const [isUserLoading, setIsUserLoading] = useState<boolean>(false);

  const isSubmitting = isSsoLoading || isAdminLoading || isUserLoading;

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

  const handleDevAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdminLoading(true);

    try {
      const result = await devAdminLogin();
      if (result.success) {
        toast({
          title: 'Development Login',
          description: 'Logged in as Admin User (Mock Data)',
        });
        router.push(result.redirectTo);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description:
          error instanceof Error ? error.message : 'An error occurred',
      });
    } finally {
      setIsAdminLoading(false);
    }
  };

  const handleDevUserLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUserLoading(true);

    try {
      const result = await devUserLogin();
      if (result.success) {
        toast({
          title: 'Development Login',
          description: 'Logged in as Regular User (Mock Data)',
        });
        router.push(result.redirectTo);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description:
          error instanceof Error ? error.message : 'An error occurred',
      });
    } finally {
      setIsUserLoading(false);
    }
  };

  const handleSsoLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSsoLoading(true);

    try {
      await ssoLogin();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'SSO Login Failed',
        description:
          error instanceof Error ? error.message : 'An error occurred',
      });
      setIsSsoLoading(false);
    }
  };

  return (
    <div className='flex min-h-screen items-center justify-center bg-background'>
      <Card className='mx-4 w-full max-w-md'>
        <CardHeader className='text-center'>
          <CardTitle className='text-2xl'>{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {/* Production SSO Login */}
            <form onSubmit={handleSsoLogin}>
              <Button type='submit' className='w-full' disabled={isSubmitting}>
                {isSsoLoading ? (
                  <Loader2 className='animate-spin' />
                ) : (
                  <LogIn />
                )}
                <span className='ml-2'>{t('signInButton')}</span>
              </Button>
            </form>

            {/* Development Mock Logins */}
            {process.env.NODE_ENV === 'development' && (
              <>
                <div className='relative'>
                  <div className='absolute inset-0 flex items-center'>
                    <span className='w-full border-t' />
                  </div>
                  <div className='relative flex justify-center text-xs uppercase'>
                    <span className='bg-background px-2 text-muted-foreground'>
                      Development Only
                    </span>
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-2'>
                  {/* Mock Admin Login */}
                  <form onSubmit={handleDevAdminLogin}>
                    <Button
                      type='submit'
                      className='w-full'
                      variant='secondary'
                      disabled={isSubmitting}
                      size='sm'
                    >
                      {isAdminLoading ? (
                        <Loader2 className='h-4 w-4 animate-spin' />
                      ) : (
                        <Shield className='h-4 w-4' />
                      )}
                      <span className='ml-1 text-xs'>Admin</span>
                    </Button>
                  </form>

                  {/* Mock User Login */}
                  <form onSubmit={handleDevUserLogin}>
                    <Button
                      type='submit'
                      className='w-full'
                      variant='outline'
                      disabled={isSubmitting}
                      size='sm'
                    >
                      {isUserLoading ? (
                        <Loader2 className='h-4 w-4 animate-spin' />
                      ) : (
                        <User className='h-4 w-4' />
                      )}
                      <span className='ml-1 text-xs'>User</span>
                    </Button>
                  </form>
                </div>

                <p className='text-center text-xs text-muted-foreground'>
                  Mock logins use test data and skip authentication
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
