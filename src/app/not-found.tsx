import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getTranslations, getLocale } from 'next-intl/server';
import { AlertCircle } from 'lucide-react';

export default async function NotFoundPage() {
  await getLocale(); // Ensure locale is set
  const t = await getTranslations('Errors.notFound');

  return (
    <div className='bg-background flex min-h-screen items-center justify-center'>
      <Card className='mx-4 w-full max-w-md text-center'>
        <CardHeader>
          <div className='bg-secondary mx-auto w-fit rounded-full p-3'>
            <AlertCircle className='text-muted-foreground h-10 w-10' />
          </div>
          <CardTitle className='mt-4 text-3xl font-bold'>
            {t('title')}
          </CardTitle>
          <CardDescription className='text-base'>
            {t('description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href='/'>{t('goHome')}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
