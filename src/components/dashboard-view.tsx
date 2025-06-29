'use client';

import { useState, useEffect, type ReactNode } from 'react';
import { Link } from '@/navigation';
import { Button } from '@/components/ui/button';
import { Logger } from '@/lib/logger';

const logger = new Logger('DASHBOARD-VIEW');
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight,
  KeyRound,
  User as UserIcon,
  Calendar,
  Server,
  Smartphone,
  ShieldCheck,
  Target,
  CheckCircle2,
  XCircle,
  Users,
  Mail,
  Palette,
  Bell,
  AlertCircle,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { User as UserType } from '@/types/user/user.types';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import UAParser from 'ua-parser-js';
import { Progress } from '@/components/ui/progress';
import { SessionInfoCard } from './session-info-card';
import { LoginActivityChart } from './login-activity-chart';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

interface DashboardViewProps {
  user: UserType;
  infoWidget: ReactNode;
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
    logger.error('Could not parse user agent:', e);
    return uaString; // Fallback to raw string on error
  }
};

export function DashboardView({ user, infoWidget }: DashboardViewProps) {
  const t = useTranslations('Dashboard');
  const tMessages = useTranslations('Messages');
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
  const completedSecurityTasks =
    Object.values(securityChecklist).filter(Boolean).length;
  const securityScore = Math.round(
    (completedSecurityTasks / totalSecurityTasks) * 100
  );

  const profileChecklist = {
    picture: !!user.picture && !user.picture.includes('placehold.co'),
    banner: !!user.banner && !user.banner.includes('placehold.co'),
    aboutMe: !!user.aboutMe,
    address: !!user.address,
    phone: !!user.phone_number,
    website: !!user.website,
  };
  const totalProfileTasks = Object.keys(profileChecklist).length;
  const completedProfileTasks =
    Object.values(profileChecklist).filter(Boolean).length;
  const profileCompletion = Math.round(
    (completedProfileTasks / totalProfileTasks) * 100
  );

  return (
    <div className='container mx-auto space-y-8 p-4 md:p-8'>
      <header className='space-y-2'>
        <h1 className='text-3xl font-bold tracking-tight md:text-4xl'>
          {t('welcome', { name: user.name })}
        </h1>
        <p className='text-lg text-muted-foreground'>{t('description')}</p>
      </header>

      <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
        <div className='space-y-8 lg:col-span-2'>
          {/* Profile Card */}
          <Card>
            <CardHeader className='flex flex-row items-center gap-4'>
              <Avatar className='h-16 w-16'>
                <AvatarImage
                  src={user.picture || ''}
                  alt={user.name}
                  data-ai-hint='profile picture'
                />
                <AvatarFallback>
                  {user.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{user.name}</CardTitle>
                <CardDescription>@{user.username}</CardDescription>
                <div className='flex items-center pt-1 text-xs text-muted-foreground'>
                  <UserIcon className='mr-1.5 h-3 w-3' />
                  <span>
                    {t('id')}: {user.sub}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className='grid grid-cols-1 gap-6 pt-6 md:grid-cols-2'>
              <div className='flex items-start gap-4'>
                <Mail className='h-5 w-5 flex-shrink-0 text-muted-foreground' />
                <div>
                  <h4 className='text-sm font-semibold'>
                    {t('profileCard.email')}
                  </h4>
                  <p className='truncate text-sm text-muted-foreground'>
                    {user.email}
                  </p>
                </div>
              </div>
              <div className='flex items-start gap-4'>
                <Users className='h-5 w-5 flex-shrink-0 text-muted-foreground' />
                <div>
                  <h4 className='text-sm font-semibold'>
                    {t('profileCard.groups')}
                  </h4>
                  <div className='mt-1 flex flex-wrap gap-2'>
                    {user.groups.length > 0 ? (
                      user.groups.map((group) => (
                        <Badge key={group} variant='outline'>
                          {group}
                        </Badge>
                      ))
                    ) : (
                      <p className='text-sm text-muted-foreground'>
                        {t('profileCard.noGroups')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild>
                <Link href='/account'>
                  {t('editProfileButton')}{' '}
                  <ArrowRight className='ml-2 h-4 w-4' />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Login History Card */}
          <Card>
            <CardHeader>
              <CardTitle>{t('loginHistory.title')}</CardTitle>
              <CardDescription>
                {t('loginHistory.description')}{' '}
                {user.fingerprint?.[0]?.date &&
                  `(${t('lastLogin')}: ${isMounted ? format(new Date(user.fingerprint[0].date), 'PPP p') : '...'})`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Calendar className='mr-2 inline-block h-4 w-4' />
                      {t('loginHistory.date')}
                    </TableHead>
                    <TableHead>
                      <Smartphone className='mr-2 inline-block h-4 w-4' />
                      {t('loginHistory.device')}
                    </TableHead>
                    <TableHead>
                      <Server className='mr-2 inline-block h-4 w-4' />
                      {t('loginHistory.ipAddress')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {user.fingerprint && user.fingerprint.length > 0 ? (
                    user.fingerprint.slice(0, 5).map((entry, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {isMounted
                            ? format(new Date(entry.date), 'PPP p')
                            : '...'}
                        </TableCell>
                        <TableCell className='max-w-xs truncate'>
                          {isMounted ? formatUserAgent(entry.device) : '...'}
                        </TableCell>
                        <TableCell>{entry.ip}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className='text-center text-muted-foreground'
                      >
                        {t('loginHistory.noHistory')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className='space-y-8 lg:col-span-1'>
          {/* Messages Preview Card */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Bell className='text-primary' />
                {t('messagesPreview.title')}
              </CardTitle>
              <CardDescription>
                {t('messagesPreview.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {user.messages.length > 0 ? (
                <div className='space-y-3'>
                  {user.messages.slice(0, 2).map((message, index) => (
                    <Alert key={index} variant='default'>
                      <AlertCircle className='h-4 w-4' />
                      <AlertTitle className='text-xs font-semibold'>
                        {tMessages('alertTitle')}
                      </AlertTitle>
                      <AlertDescription className='text-xs'>
                        {message}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              ) : (
                <p className='text-sm text-muted-foreground'>
                  {t('messagesPreview.noMessages')}
                </p>
              )}
            </CardContent>
            {user.messages.length > 0 && (
              <CardFooter>
                <Button asChild className='w-full' variant='secondary'>
                  <Link href='/messages'>
                    {t('messagesPreview.viewAllButton')}
                    <ArrowRight className='ml-2 h-4 w-4' />
                  </Link>
                </Button>
              </CardFooter>
            )}
          </Card>

          <SessionInfoCard user={user} />

          {/* Security Health Card */}
          <Card className='flex flex-col'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <ShieldCheck className='text-primary' />
                {t('securityHealth.title')}
              </CardTitle>
              <CardDescription>
                {t('securityHealth.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className='flex-grow space-y-3'>
              {Object.entries(securityChecklist).map(([key, isComplete]) => (
                <div key={key} className='flex items-center text-sm'>
                  {isComplete ? (
                    <CheckCircle2 className='mr-2 h-4 w-4 text-green-500' />
                  ) : (
                    <XCircle className='mr-2 h-4 w-4 text-muted-foreground' />
                  )}
                  <span
                    className={
                      isComplete ? 'text-foreground' : 'text-muted-foreground'
                    }
                  >
                    {t(`securityHealth.checks.${key}`)}
                  </span>
                </div>
              ))}
            </CardContent>
            <CardFooter className='flex-col items-start gap-4'>
              <div className='w-full text-center'>
                <p className='text-2xl font-bold'>
                  {t('securityHealth.score', { score: securityScore })}
                </p>
              </div>
              <Button asChild className='w-full'>
                <Link href='/security'>{t('securityHealth.manageButton')}</Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Profile Completion Card */}
          <Card className='flex flex-col'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Target className='text-primary' />
                {t('profileCompletion.title')}
              </CardTitle>
              <CardDescription>
                {t('profileCompletion.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className='flex-grow space-y-4'>
              <div className='flex items-center gap-4'>
                <Progress value={profileCompletion} className='w-full' />
                <span className='font-bold'>
                  {t('profileCompletion.percentage', {
                    percentage: profileCompletion,
                  })}
                </span>
              </div>
              <div className='space-y-2'>
                {Object.entries(profileChecklist).map(([key, isComplete]) => (
                  <div key={key} className='flex items-center text-sm'>
                    {isComplete ? (
                      <CheckCircle2 className='mr-2 h-4 w-4 text-green-500' />
                    ) : (
                      <XCircle className='mr-2 h-4 w-4 text-muted-foreground' />
                    )}
                    <span
                      className={
                        isComplete ? 'text-foreground' : 'text-muted-foreground'
                      }
                    >
                      {t(`profileCompletion.tasks.${key}`)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild className='w-full' variant='outline'>
                <Link href='/account'>
                  {t('profileCompletion.completeProfileButton')}
                </Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Quick Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle>{t('quickActions.title')}</CardTitle>
              <CardDescription>{t('quickActions.description')}</CardDescription>
            </CardHeader>
            <CardContent className='space-y-2'>
              <Button
                asChild
                variant='outline'
                className='w-full justify-start'
              >
                <Link href='/security'>
                  <KeyRound className='mr-2 h-4 w-4' />
                  {t('quickActions.changePassword')}
                </Link>
              </Button>
              <Button
                asChild
                variant='outline'
                className='w-full justify-start'
              >
                <Link href='/security'>
                  <ShieldCheck className='mr-2 h-4 w-4' />
                  {t('quickActions.manageSecurity')}
                </Link>
              </Button>
              <Button
                asChild
                variant='outline'
                className='w-full justify-start'
              >
                <Link href='/settings'>
                  <Palette className='mr-2 h-4 w-4' />
                  {t('quickActions.appearanceSettings')}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className='mt-8'>
        <LoginActivityChart fingerprint={user.fingerprint} />
      </div>
      <div className='mt-8'>{infoWidget}</div>
    </div>
  );
}
