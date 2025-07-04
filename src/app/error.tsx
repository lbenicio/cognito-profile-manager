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
import { Logger } from '@/lib/logger';

const logger = new Logger('ERROR-PAGE');

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
    logger.error('Application error occurred:', error);
  }, [error]);

  return (
    <div className='bg-background flex min-h-screen items-center justify-center'>
      <Card className='mx-4 w-full max-w-md text-center'>
        <CardHeader>
          <div className='bg-destructive/10 mx-auto w-fit rounded-full p-3'>
            <AlertTriangle className='text-destructive h-10 w-10' />
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
