
import { Link } from '@/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { FileQuestion } from 'lucide-react';

export default async function NotFoundPage({ params }: { params: { locale: string } }) {
  unstable_setRequestLocale(params.locale);
  const t = await getTranslations('Errors.notFound');

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md mx-4 text-center">
        <CardHeader>
          <div className="mx-auto bg-secondary p-3 rounded-full w-fit">
            <FileQuestion className="h-10 w-10 text-muted-foreground" />
          </div>
          <CardTitle className="text-3xl font-bold mt-4">{t('title')}</CardTitle>
          <CardDescription className="text-base">
            {t('description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/">{t('goHome')}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
