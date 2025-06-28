import { Link } from '@/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { FileQuestion } from 'lucide-react';

export default async function NotFoundPage({
  params,
}: {
  params: { locale: string };
}) {
  unstable_setRequestLocale(params.locale);
  const t = await getTranslations('Errors.notFound');

  return (
    <div className='flex min-h-screen items-center justify-center bg-background'>
      <Card className='mx-4 w-full max-w-md text-center'>
        <CardHeader>
          <div className='mx-auto w-fit rounded-full bg-secondary p-3'>
            <FileQuestion className='h-10 w-10 text-muted-foreground' />
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
