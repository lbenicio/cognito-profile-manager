'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { login } from '@/lib/auth-actions';
import { useFormState, useFormStatus } from 'react-dom';
import { LogIn, LayoutDashboard } from 'lucide-react';
import { Link } from '@/navigation';

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function SubmitButton() {
    const { pending } = useFormStatus();
    const t = useTranslations('Login');

    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
            ) : (
                <LogIn className="mr-2 h-4 w-4" />
            )}
            {t('signInButton')}
        </Button>
    )
}

export default function LoginPage() {
  const t = useTranslations('Login');
  const [errorMessage, dispatch] = useFormState(login, undefined);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <div className="absolute top-8 flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Outpost</span>
        </div>
        <Card className="w-full max-w-sm">
            <CardHeader className="text-center">
            <CardTitle className="text-2xl">{t('title')}</CardTitle>
            <CardDescription>{t('description')}</CardDescription>
            </CardHeader>
            <CardContent>
            <Form {...form}>
              <form action={dispatch} className="space-y-4">
                 <div className="space-y-2">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('emailLabel')}</FormLabel>
                            <FormControl>
                            <Input type="email" placeholder="you@example.com" required {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('passwordLabel')}</FormLabel>
                            <FormControl>
                             <Input type="password" required {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>

                {errorMessage && (
                    <div className="text-sm font-medium text-destructive text-center">
                    {errorMessage}
                    </div>
                )}
                <SubmitButton />
              </form>
            </Form>
            </CardContent>
        </Card>
    </div>
  );
}
