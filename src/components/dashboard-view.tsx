'use client';

import { useState, useEffect } from 'react';
import { Link } from '@/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, KeyRound, User, Calendar, Server, Smartphone, ShieldCheck, Target, CheckCircle2, XCircle, Users, Mail } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { User as UserType } from '@/lib/auth';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import UAParser from 'ua-parser-js';
import { Progress } from '@/components/ui/progress';

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

  const securityChecklist = {
    email: user.email_verified,
    phone: user.phone_number_verified,
    twoFactor: user.twoFactorEnabled,
    passkeys: user.passkeysEnabled,
  };
  const totalSecurityTasks = Object.keys(securityChecklist).length;
  const completedSecurityTasks = Object.values(securityChecklist).filter(Boolean).length;
  const securityScore = Math.round((completedSecurityTasks / totalSecurityTasks) * 100);

  const profileChecklist = {
    picture: !!user.picture && !user.picture.includes('placehold.co'),
    banner: !!user.banner && !user.banner.includes('placehold.co'),
    aboutMe: !!user.aboutMe,
    address: !!user.address,
    phone: !!user.phone_number,
    website: !!user.website,
  };
  const totalProfileTasks = Object.keys(profileChecklist).length;
  const completedProfileTasks = Object.values(profileChecklist).filter(Boolean).length;
  const profileCompletion = Math.round((completedProfileTasks / totalProfileTasks) * 100);

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{t('welcome', {name: user.name})}</h1>
        <p className="text-muted-foreground text-lg">
          {t('description')}
        </p>
      </header>
      
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center gap-4">
             <Avatar className="h-16 w-16">
                <AvatarImage src={user.picture || ''} alt={user.name} data-ai-hint="profile picture" />
                <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
             </Avatar>
             <div>
                <CardTitle>{user.name}</CardTitle>
                <CardDescription>@{user.username}</CardDescription>
             </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                <span className="truncate">{user.email}</span>
            </div>
            <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-muted-foreground mt-1 flex-shrink-0" />
                <div className="flex-1">
                    <span className="font-semibold">{t('profileCard.groups')}</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {user.groups.length > 0 ? user.groups.map(group => (
                            <Badge key={group} variant="outline">{group}</Badge>
                        )) : (
                            <span className="text-muted-foreground">{t('profileCard.noGroups')}</span>
                        )}
                    </div>
                </div>
            </div>
          </CardContent>
           <CardFooter>
             <Button asChild>
                <Link href="/account">{t('editProfileButton')} <ArrowRight className="ml-2 h-4 w-4" /></Link>
             </Button>
           </CardFooter>
        </Card>

        {/* Security Health Card */}
        <Card className="flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="text-primary"/>
                  {t('securityHealth.title')}
                </CardTitle>
                <CardDescription>{t('securityHealth.description')}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-3">
                {Object.entries(securityChecklist).map(([key, isComplete]) => (
                     <div key={key} className="flex items-center text-sm">
                        {isComplete ? (
                            <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                        ) : (
                            <XCircle className="h-4 w-4 mr-2 text-muted-foreground" />
                        )}
                        <span className={isComplete ? 'text-foreground' : 'text-muted-foreground'}>
                            {t(`securityHealth.checks.${key}`)}
                        </span>
                    </div>
                ))}
            </CardContent>
           <CardFooter className="flex-col items-start gap-4">
              <div className="text-center w-full">
                <p className="text-2xl font-bold">{t('securityHealth.score', {score: securityScore})}</p>
              </div>
              <Button asChild className="w-full">
                <Link href="/security">{t('securityHealth.manageButton')}</Link>
              </Button>
           </CardFooter>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Completion Card */}
        <Card className="flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="text-primary"/>
                  {t('profileCompletion.title')}
                </CardTitle>
                <CardDescription>{t('profileCompletion.description')}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
                <div className="flex items-center gap-4">
                  <Progress value={profileCompletion} className="w-full" />
                  <span className="font-bold">{t('profileCompletion.percentage', {percentage: profileCompletion})}</span>
                </div>
                <div className="space-y-2">
                  {Object.entries(profileChecklist).map(([key, isComplete]) => (
                     <div key={key} className="flex items-center text-sm">
                        {isComplete ? (
                            <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                        ) : (
                            <XCircle className="h-4 w-4 mr-2 text-muted-foreground" />
                        )}
                        <span className={isComplete ? 'text-foreground' : 'text-muted-foreground'}>
                            {t(`profileCompletion.tasks.${key}`)}
                        </span>
                    </div>
                  ))}
                </div>
            </CardContent>
           <CardFooter>
              <Button asChild className="w-full" variant="outline">
                <Link href="/account">{t('profileCompletion.completeProfileButton')}</Link>
              </Button>
           </CardFooter>
        </Card>

        {/* Login History Card */}
        <Card className="lg:col-span-2">
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
    </div>
  );
}
