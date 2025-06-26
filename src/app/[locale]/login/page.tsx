'use client';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { login } from '@/lib/auth-actions';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Shield } from 'lucide-react';

function SubmitButton() {
    const { pending } = useFormStatus();
    const t = useTranslations('Login');

    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
            ) : (
                <Shield className="mr-2 h-4 w-4" />
            )}
            {t('signInButton')}
        </Button>
    )
}

export default function LoginPage() {
  const t = useTranslations('Login');
  const [errorMessage, dispatch] = useActionState(login, undefined);

  return (
    <div className="flex flex-col flex-1 items-center justify-center p-4">
        <Card className="w-full max-w-sm">
            <CardHeader className="text-center">
            <CardTitle className="text-2xl">{t('title')}</CardTitle>
            <CardDescription>{t('description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={dispatch}>
                 {errorMessage && (
                    <div className="text-sm font-medium text-destructive text-center mb-4">
                        {t('errorDescription')}
                    </div>
                )}
                <SubmitButton />
              </form>
            </CardContent>
        </Card>
    </div>
  );
}
