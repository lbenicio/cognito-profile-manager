'use client';

import type {
  DashboardTranslations,
  DashboardViewProps,
} from '@/types/components.types';
import { useState, useEffect, type ReactNode } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logger } from '@/lib/logger';
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
import { format } from 'date-fns';
import { UAParser } from 'ua-parser-js';
import { Progress } from '@/components/ui/progress';
import { SessionInfoCard } from './session-info-card';
import { LoginActivityChart } from './login-activity-chart';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

const logger = new Logger('DASHBOARD-VIEW');

const formatUserAgent = (uaString: string): string => {
  if (!uaString || uaString === 'Unknown') {
    return 'Unknown';
  }

  try {
    const parser = new UAParser();
    parser.setUA(uaString);
    const browser = parser.getBrowser();
    const os = parser.getOS();
    const device = parser.getDevice();

    const parts: string[] = [];

    if (browser.name) {
      parts.push(browser.name);
    }

    if (device.model && device.type && device.type !== undefined) {
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

export function DashboardView({
  user,
  infoWidget,
  translations,
}: DashboardViewProps) {
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
          {translations.welcome}
        </h1>
        <p className='text-muted-foreground text-lg'>
          {translations.description}
        </p>
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
                <div className='text-muted-foreground flex items-center pt-1 text-xs'>
                  <UserIcon className='mr-1.5 h-3 w-3' />
                  <span>
                    {translations.id}: {user.sub}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className='grid grid-cols-1 gap-6 pt-6 md:grid-cols-2'>
              <div className='flex items-start gap-4'>
                <Mail className='text-muted-foreground h-5 w-5 shrink-0' />
                <div>
                  <h4 className='text-sm font-semibold'>
                    {translations.profileCard.email}
                  </h4>
                  <p className='text-muted-foreground truncate text-sm'>
                    {user.email}
                  </p>
                </div>
              </div>
              <div className='flex items-start gap-4'>
                <Users className='text-muted-foreground h-5 w-5 shrink-0' />
                <div>
                  <h4 className='text-sm font-semibold'>
                    {translations.profileCard.groups}
                  </h4>
                  <div className='mt-1 flex flex-wrap gap-2'>
                    {user.groups.length > 0 ? (
                      user.groups.map((group) => (
                        <Badge key={group} variant='outline'>
                          {group}
                        </Badge>
                      ))
                    ) : (
                      <p className='text-muted-foreground text-sm'>
                        {translations.profileCard.noGroups}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild>
                <Link href='/account'>
                  {translations.editProfileButton}{' '}
                  <ArrowRight className='ml-2 h-4 w-4' />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Login History Card */}
          <Card>
            <CardHeader>
              <CardTitle>{translations.loginHistory.title}</CardTitle>
              <CardDescription>
                {translations.loginHistory.description}{' '}
                {user.fingerprint?.[0]?.date &&
                  `(${translations.lastLogin}: ${isMounted ? format(new Date(user.fingerprint[0].date), 'PPP p') : '...'})`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Calendar className='mr-2 inline-block h-4 w-4' />
                      {translations.loginHistory.date}
                    </TableHead>
                    <TableHead>
                      <Smartphone className='mr-2 inline-block h-4 w-4' />
                      {translations.loginHistory.device}
                    </TableHead>
                    <TableHead>
                      <Server className='mr-2 inline-block h-4 w-4' />
                      {translations.loginHistory.ipAddress}
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
                        className='text-muted-foreground text-center'
                      >
                        {translations.loginHistory.noHistory}
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
                {translations.messagesPreview.title}
              </CardTitle>
              <CardDescription>
                {translations.messagesPreview.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {user.messages.length > 0 ? (
                <div className='space-y-3'>
                  {user.messages.slice(0, 2).map((message, index) => (
                    <Alert key={index} variant='default'>
                      <AlertCircle className='h-4 w-4' />
                      <AlertTitle className='text-xs font-semibold'>
                        {translations.messages.alertTitle}
                      </AlertTitle>
                      <AlertDescription className='text-xs'>
                        {message}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              ) : (
                <p className='text-muted-foreground text-sm'>
                  {translations.messagesPreview.noMessages}
                </p>
              )}
            </CardContent>
            {user.messages.length > 0 && (
              <CardFooter>
                <Button asChild className='w-full' variant='secondary'>
                  <Link href='/messages'>
                    {translations.messagesPreview.viewAllButton}
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
                {translations.securityHealth.title}
              </CardTitle>
              <CardDescription>
                {translations.securityHealth.description}
              </CardDescription>
            </CardHeader>
            <CardContent className='grow space-y-3'>
              {Object.entries(securityChecklist).map(([key, isComplete]) => (
                <div key={key} className='flex items-center text-sm'>
                  {isComplete ? (
                    <CheckCircle2 className='mr-2 h-4 w-4 text-green-500' />
                  ) : (
                    <XCircle className='text-muted-foreground mr-2 h-4 w-4' />
                  )}
                  <span
                    className={
                      isComplete ? 'text-foreground' : 'text-muted-foreground'
                    }
                  >
                    {
                      translations.securityHealth.checks[
                        key as keyof typeof translations.securityHealth.checks
                      ]
                    }
                  </span>
                </div>
              ))}
            </CardContent>
            <CardFooter className='flex-col items-start gap-4'>
              <div className='w-full text-center'>
                <p className='text-2xl font-bold'>
                  {translations.securityHealth.score}
                </p>
              </div>
              <Button asChild className='w-full'>
                <Link href='/security'>
                  {translations.securityHealth.manageButton}
                </Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Profile Completion Card */}
          <Card className='flex flex-col'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Target className='text-primary' />
                {translations.profileCompletion.title}
              </CardTitle>
              <CardDescription>
                {translations.profileCompletion.description}
              </CardDescription>
            </CardHeader>
            <CardContent className='grow space-y-4'>
              <div className='flex items-center gap-4'>
                <Progress value={profileCompletion} className='w-full' />
                <span className='font-bold'>
                  {translations.profileCompletion.percentage}
                </span>
              </div>
              <div className='space-y-2'>
                {Object.entries(profileChecklist).map(([key, isComplete]) => (
                  <div key={key} className='flex items-center text-sm'>
                    {isComplete ? (
                      <CheckCircle2 className='mr-2 h-4 w-4 text-green-500' />
                    ) : (
                      <XCircle className='text-muted-foreground mr-2 h-4 w-4' />
                    )}
                    <span
                      className={
                        isComplete ? 'text-foreground' : 'text-muted-foreground'
                      }
                    >
                      {
                        translations.profileCompletion.tasks[
                          key as keyof typeof translations.profileCompletion.tasks
                        ]
                      }
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild className='w-full' variant='outline'>
                <Link href='/account'>
                  {translations.profileCompletion.completeProfileButton}
                </Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Quick Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle>{translations.quickActions.title}</CardTitle>
              <CardDescription>
                {translations.quickActions.description}
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-2'>
              <Button
                asChild
                variant='outline'
                className='w-full justify-start'
              >
                <Link href='/security'>
                  <KeyRound className='mr-2 h-4 w-4' />
                  {translations.quickActions.changePassword}
                </Link>
              </Button>
              <Button
                asChild
                variant='outline'
                className='w-full justify-start'
              >
                <Link href='/security'>
                  <ShieldCheck className='mr-2 h-4 w-4' />
                  {translations.quickActions.manageSecurity}
                </Link>
              </Button>
              <Button
                asChild
                variant='outline'
                className='w-full justify-start'
              >
                <Link href='/settings'>
                  <Palette className='mr-2 h-4 w-4' />
                  {translations.quickActions.appearanceSettings}
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
