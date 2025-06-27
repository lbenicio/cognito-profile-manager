'use client';

import { useState, useEffect } from 'react';
import { Link } from '@/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, KeyRound, Palette, ShieldCheck, User, Calendar, Server, Smartphone } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { User as UserType } from '@/lib/auth';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import UAParser from 'ua-parser-js';

interface DashboardViewProps {
  user: UserType;
}

const formatUserAgent = (uaString: string): string => {
  if (!uaString || uaString === 'Unknown') {
    return 'Unknown';
  }

  try {
    const parser = new UAParser(uaString);
    const browser = parser.getBrowser();
    const os = parser.getOS();
    const device = parser.getDevice();
  
    const parts: string[] = [];
    
    if (browser.name) {
      parts.push(browser.name);
    }
  
    if (device.model && device.type !== 'desktop') {
      parts.push(`on ${device.model}`);
    } else if (os.name) {
      parts.push(`on ${os.name}`);
    }
    
    const friendlyString = parts.join(' ');
    return friendlyString || uaString;
  } catch (e) {
    console.error("Could not parse user agent:", e);
    return uaString; // Fallback to raw string on error
  }
};


export function DashboardView({ user }: DashboardViewProps) {
  const t = useTranslations('Dashboard');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
                <AvatarImage src={user.picture || ''} alt={user.name} data-ai-hint="profile picture" />
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
                <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-2"><KeyRound className="h-4 w-4" /> {t('profileCard.passkeyStatus')}</span>
                    {user.passkeysEnabled ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">{t('enabled')}</Badge>
                    ) : (
                        <Badge variant="destructive">{t('disabled')}</Badge>
                    )}
                </div>
            </div>
          </CardContent>
           <div className="p-6 pt-0">
             <Button asChild>
                <Link href="/account">{t('manageAccount')} <ArrowRight className="ml-2 h-4 w-4" /></Link>
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
                    <Link href="/account">
                        <KeyRound /> {t('quickActions.changePassword')}
                    </Link>
                </Button>
                 <Button variant="outline" className="justify-start" asChild>
                    <Link href="/account">
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

      {/* Login History Card */}
      <Card>
        <CardHeader>
          <CardTitle>{t('loginHistory.title')}</CardTitle>
          <CardDescription>{t('loginHistory.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead><Calendar className="inline-block mr-2 h-4 w-4" />{t('loginHistory.date')}</TableHead>
                <TableHead><Smartphone className="inline-block mr-2 h-4 w-4" />{t('loginHistory.device')}</TableHead>
                <TableHead><Server className="inline-block mr-2 h-4 w-4" />{t('loginHistory.ipAddress')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {user.fingerprint && user.fingerprint.length > 0 ? (
                user.fingerprint.slice(0, 5).map((entry, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      {isMounted ? format(new Date(entry.date), "PPP p") : '...'}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{isMounted ? formatUserAgent(entry.device) : '...'}</TableCell>
                    <TableCell>{entry.ip}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    {t('loginHistory.noHistory')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

    </div>
  );
}
