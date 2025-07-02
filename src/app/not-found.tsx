import { Link } from '@/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getTranslations } from 'next-intl/server';
import { getLocale } from '@/i18n/i18n';
import { AlertCircle } from 'lucide-react';

export default async function NotFoundPage() {
  await getLocale(); // Ensure locale is set
  const t = await getTranslations('Errors.notFound');

  return (
    <div className='flex min-h-screen items-center justify-center bg-background'>
      <Card className='mx-4 w-full max-w-md text-center'>
        <CardHeader>
          <div className='mx-auto w-fit rounded-full bg-secondary p-3'>
            <AlertCircle className='h-10 w-10 text-muted-foreground' />
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
