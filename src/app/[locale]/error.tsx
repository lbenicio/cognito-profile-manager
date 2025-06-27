
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md mx-4 text-center">
         <CardHeader>
           <div className="mx-auto bg-destructive/10 p-3 rounded-full w-fit">
             <AlertTriangle className="h-10 w-10 text-destructive" />
           </div>
           <CardTitle className="text-3xl font-bold mt-4">{t('title')}</CardTitle>
           <CardDescription className="text-base">
             {t('description')}
           </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => reset()}>
            {t('tryAgain')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
