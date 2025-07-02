import { getUser } from '@/lib/auth';
import { getTranslations } from 'next-intl/server';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { clearMessages } from '@/lib/actions/messages.action';
import { AlertCircle, Trash2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default async function MessagesPage() {
  const user = await getUser();
  const t = await getTranslations('Messages');

  if (!user) {
    // This should ideally be handled by middleware, but as a fallback:
    return <p>Authentication error.</p>;
  }

  return (
    <div className='container mx-auto max-w-4xl p-4 md:p-8'>
      <header className='mb-8'>
        <h1 className='text-3xl font-bold tracking-tight'>{t('title')}</h1>
        <p className='text-muted-foreground'>{t('description')}</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>{t('allMessages')}</CardTitle>
          <CardDescription>
            {t('messagesCount', { count: user.messages.length })}
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          {user.messages.length > 0 ? (
            user.messages.map((message, index) => (
              <Alert key={index}>
                <AlertCircle className='h-4 w-4' />
                <AlertTitle>{t('alertTitle')}</AlertTitle>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            ))
          ) : (
            <div className='flex flex-col items-center justify-center rounded-md border-2 border-dashed p-12 text-center'>
              <h3 className='text-lg font-semibold'>{t('noMessages.title')}</h3>
              <p className='mt-1 text-sm text-muted-foreground'>
                {t('noMessages.description')}
              </p>
            </div>
          )}
        </CardContent>
        {user.messages.length > 0 && (
          <CardFooter>
            <form action={clearMessages}>
              <Button variant='destructive'>
                <Trash2 className='mr-2 h-4 w-4' />
                {t('clearAllButton')}
              </Button>
            </form>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
