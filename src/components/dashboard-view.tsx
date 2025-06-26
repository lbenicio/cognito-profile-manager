'use client';

import { Link } from '@/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, KeyRound, Palette, ShieldCheck, User } from 'lucide-react';
import type { User as UserType } from '@/lib/auth';
import { useTranslations } from 'next-intl';

interface DashboardViewProps {
  user: UserType;
}

export function DashboardView({ user }: DashboardViewProps) {
  const t = useTranslations('Dashboard');

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{t('welcome', {name: user.name})}</h1>
        <p className="text-muted-foreground text-lg">
          {t('description')}
        </p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center gap-4">
             <Avatar className="h-12 w-12 sm:h-16 sm:w-16">
                <AvatarImage src={`https://placehold.co/128x128.png`} alt={user.name} data-ai-hint="profile picture" />
                <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
             </Avatar>
             <div>
                <CardTitle>{user.name}</CardTitle>
                <CardDescription>@{user.username}</CardDescription>
             </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-muted-foreground flex items-center gap-2"><User className="h-4 w-4" /> {t('profileCard.email')}</span>
                    <div className="flex items-center gap-2">
                        <span className="truncate">{user.email}</span>
                        {user.email_verified ? (
                            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">{t('verified')}</Badge>
                        ) : (
                            <Badge variant="destructive">{t('unverified')}</Badge>
                        )}
                    </div>
                </div>
                 <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> {t('profileCard.twoFactorStatus')}</span>
                    {user.twoFactorEnabled ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">{t('enabled')}</Badge>
                    ) : (
                        <Badge variant="destructive">{t('disabled')}</Badge>
                    )}
                </div>
            </div>
          </CardContent>
           <div className="p-6 pt-0">
             <Button asChild>
                <Link href="/profile">{t('manageProfile')} <ArrowRight className="ml-2 h-4 w-4" /></Link>
             </Button>
           </div>
        </Card>

        {/* Quick Actions Card */}
        <Card>
            <CardHeader>
                <CardTitle>{t('quickActions.title')}</CardTitle>
                <CardDescription>{t('quickActions.description')}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                <Button variant="outline" className="justify-start" asChild>
                    <Link href="/profile">
                        <KeyRound /> {t('quickActions.changePassword')}
                    </Link>
                </Button>
                 <Button variant="outline" className="justify-start" asChild>
                    <Link href="/profile">
                        <ShieldCheck /> {t('quickActions.manageSecurity')}
                    </Link>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                    <Link href="/settings">
                        <Palette /> {t('quickActions.appearanceSettings')}
                    </Link>
                </Button>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
