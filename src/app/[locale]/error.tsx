'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useTranslations } from 'next-intl';
import { AlertTriangle } from 'lucide-react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('Errors.generic');

  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className='flex min-h-screen items-center justify-center bg-background'>
      <Card className='mx-4 w-full max-w-md text-center'>
        <CardHeader>
          <div className='mx-auto w-fit rounded-full bg-destructive/10 p-3'>
            <AlertTriangle className='h-10 w-10 text-destructive' />
          </div>
          <CardTitle className='mt-4 text-3xl font-bold'>
            {t('title')}
          </CardTitle>
          <CardDescription className='text-base'>
            {t('description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => reset()}>{t('tryAgain')}</Button>
        </CardContent>
      </Card>
    </div>
  );
}
