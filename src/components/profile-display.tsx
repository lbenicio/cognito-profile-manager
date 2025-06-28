'use client';
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
  Mail,
  Home,
  Phone,
  CalendarDays,
  BadgeCheck,
  Shield,
  Users,
  Globe,
  Clock,
  Languages,
  Edit,
  PersonStanding,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useState, useEffect } from 'react';
import { AvatarEditor } from './avatar-editor';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import type { ProfileDisplayProps } from '@/interfaces/components/profile-display.interfaces';

export function ProfileDisplay({ user, onUpdate }: ProfileDisplayProps) {
  const t = useTranslations('Dashboard');
  const tProfile = useTranslations('Profile');
  const tDashboard = useTranslations('Dashboard.profileCard');
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [memberSince, setMemberSince] = useState<string | null>(null);

  const { toast } = useToast();
  const [emailLoading, setEmailLoading] = useState<boolean>(false);
  const [phoneLoading, setPhoneLoading] = useState<boolean>(false);

  useEffect(() => {
    if (user.creationDate) {
      setMemberSince(format(parseISO(user.creationDate), 'MMMM d, yyyy'));
    }
  }, [user.creationDate]);

  const handleSendVerificationEmail = async (): Promise<void> => {
    setEmailLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast({
      title: tProfile('verification.sentTitle'),
      description: tProfile('verification.emailSentDescription', {
        email: user.email,
      }),
    });
    setEmailLoading(false);
  };

  const handleSendVerificationSms = async (): Promise<void> => {
    setPhoneLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast({
      title: tProfile('verification.sentTitle'),
      description: tProfile('verification.phoneSentDescription', {
        phone: user.phone_number,
      }),
    });
    setPhoneLoading(false);
  };

  return (
    <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
      <Card>
        <CardHeader>
          <div className='flex items-center gap-4'>
            <DialogTrigger asChild>
              <div className='group relative cursor-pointer'>
                <Avatar className='h-12 w-12 sm:h-16 sm:w-16'>
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
                <div className='absolute inset-0 flex items-center justify-center rounded-full bg-black/60 opacity-0 transition-opacity group-hover:opacity-100'>
                  <Edit className='h-5 w-5 text-white sm:h-6 sm:w-6' />
                </div>
              </div>
            </DialogTrigger>
            <div>
              <div className='flex items-center gap-2'>
                <CardTitle className='font-headline text-2xl'>
                  {user.name}
                </CardTitle>
                {user.isAdmin ? (
                  <Badge>
                    <Shield className='mr-1 h-3 w-3' />
                    {tDashboard('adminBadge')}
                  </Badge>
                ) : (
                  <Badge variant='secondary'>{tDashboard('userBadge')}</Badge>
                )}
              </div>
              <CardDescription>@{user.username}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className='space-y-4 text-sm'>
          <div className='flex items-center justify-between gap-4'>
            <div className='flex min-w-0 items-center gap-3'>
              <Mail className='h-5 w-5 flex-shrink-0 text-muted-foreground' />
              <span className='truncate'>{user.email}</span>
            </div>
            {user.email_verified ? (
              <Badge
                variant='secondary'
                className='flex flex-shrink-0 items-center gap-1 bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
              >
                <BadgeCheck className='h-3.5 w-3.5' />
                {t('verified')}
              </Badge>
            ) : (
              <Button
                variant='outline'
                size='sm'
                onClick={handleSendVerificationEmail}
                disabled={emailLoading}
                className='flex-shrink-0'
              >
                {emailLoading ? (
                  <div className='h-4 w-4 animate-spin rounded-full border-b-2 border-primary'></div>
                ) : (
                  tProfile('verification.resend')
                )}
              </Button>
            )}
          </div>
          <div className='flex items-center justify-between gap-4'>
            <div className='flex min-w-0 items-center gap-3'>
              <Phone className='h-5 w-5 flex-shrink-0 text-muted-foreground' />
              <span className='text-sm'>
                {user.phone_number || tProfile('display.notSet')}
              </span>
            </div>
            {user.phone_number &&
              (user.phone_number_verified ? (
                <Badge
                  variant='secondary'
                  className='flex flex-shrink-0 items-center gap-1 bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                >
                  <BadgeCheck className='h-3.5 w-3.5' />
                  {t('verified')}
                </Badge>
              ) : (
                <Button
                  variant='outline'
                  size='sm'
                  onClick={handleSendVerificationSms}
                  disabled={phoneLoading}
                  className='flex-shrink-0'
                >
                  {phoneLoading ? (
                    <div className='h-4 w-4 animate-spin rounded-full border-b-2 border-primary'></div>
                  ) : (
                    tProfile('verification.resend')
                  )}
                </Button>
              ))}
          </div>
          <div className='flex items-start gap-3'>
            <Home className='mt-1 h-5 w-5 flex-shrink-0 text-muted-foreground' />
            <span className='flex-1'>
              {user.address || tProfile('display.notSet')}
            </span>
          </div>
          <div className='flex items-start gap-3'>
            <PersonStanding className='mt-1 h-5 w-5 flex-shrink-0 text-muted-foreground' />
            <span className='flex-1'>
              {user.gender || tProfile('display.notSet')}
            </span>
          </div>
          {user.website && (
            <div className='flex items-center gap-3'>
              <Globe className='h-5 w-5 text-muted-foreground' />
              <a
                href={user.website}
                target='_blank'
                rel='noopener noreferrer'
                className='text-primary hover:underline'
              >
                {user.website}
              </a>
            </div>
          )}
          {user.zoneinfo && (
            <div className='flex items-center gap-3'>
              <Clock className='h-5 w-5 text-muted-foreground' />
              <span>{user.zoneinfo}</span>
            </div>
          )}
          {user.locale && (
            <div className='flex items-center gap-3'>
              <Languages className='h-5 w-5 text-muted-foreground' />
              <span>{user.locale}</span>
            </div>
          )}
          <Separator className='my-4' />
          <div className='space-y-2'>
            <h4 className='font-semibold'>
              {tProfile('display.aboutMeTitle')}
            </h4>
            <p className='whitespace-pre-wrap text-sm text-muted-foreground'>
              {user.aboutMe || tProfile('display.notSet')}
            </p>
          </div>
          <Separator className='my-4' />
          <div className='flex items-start gap-3'>
            <Users className='mt-1 h-5 w-5 flex-shrink-0 text-muted-foreground' />
            <div className='flex-1'>
              <span className='font-semibold'>{tDashboard('groups')}</span>
              <div className='mt-2 flex flex-wrap gap-2'>
                {user.groups.length > 0 ? (
                  user.groups.map((group) => (
                    <Badge key={group} variant='outline'>
                      {group}
                    </Badge>
                  ))
                ) : (
                  <span className='text-muted-foreground'>
                    {tDashboard('noGroups')}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className='flex-col items-start gap-2 border-t pt-4 text-xs text-muted-foreground'>
          <div className='flex items-center gap-2'>
            <BadgeCheck className='h-4 w-4' />
            <span>
              {tProfile('display.status', { status: user.userStatus })}
            </span>
          </div>
          <div
            className='flex items-center gap-2'
            style={{ minHeight: '20px' }}
          >
            <CalendarDays className='h-4 w-4' />
            {memberSince && (
              <span>
                {tProfile('display.memberSince', { date: memberSince })}
              </span>
            )}
          </div>
        </CardFooter>
      </Card>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{tProfile('editAvatarTitle')}</DialogTitle>
          <DialogDescription>
            {tProfile('editAvatarDescription')}
          </DialogDescription>
        </DialogHeader>
        <AvatarEditor
          user={user}
          onUpdate={onUpdate}
          onClose={() => setIsEditorOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
