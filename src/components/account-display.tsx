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
  Image as ImageIcon,
  Cake,
} from 'lucide-react';
import Image from 'next/image';
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
import { BannerEditor } from './banner-editor';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import type { AccountDisplayProps } from '@/interfaces/components/account-display.interfaces';

export function AccountDisplay({ user, onUpdateAction }: AccountDisplayProps) {
  const t = useTranslations('Dashboard');
  const tAccount = useTranslations('Account');
  const tDashboard = useTranslations('Dashboard.profileCard');
  const [isAvatarEditorOpen, setIsAvatarEditorOpen] = useState<boolean>(false);
  const [isBannerEditorOpen, setIsBannerEditorOpen] = useState<boolean>(false);
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
      title: tAccount('verification.sentTitle'),
      description: tAccount('verification.emailSentDescription', {
        email: user.email,
      }),
    });
    setEmailLoading(false);
  };

  const handleSendVerificationSms = async (): Promise<void> => {
    setPhoneLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast({
      title: tAccount('verification.sentTitle'),
      description: tAccount('verification.phoneSentDescription', {
        phone: user.phone_number,
      }),
    });
    setPhoneLoading(false);
  };

  return (
    <Dialog open={isBannerEditorOpen} onOpenChange={setIsBannerEditorOpen}>
      <Card>
        <div className='group relative'>
          <DialogTrigger asChild>
            <div className='cursor-pointer'>
              <Image
                src={user.banner || 'https://placehold.co/1500x500.png'}
                alt='User banner'
                width={1500}
                height={500}
                className='h-32 w-full rounded-t-lg object-cover'
                data-ai-hint='user banner'
              />
              <div className='absolute inset-0 flex items-center justify-center rounded-t-lg bg-black/60 opacity-0 transition-opacity group-hover:opacity-100'>
                <div className='flex items-center gap-2 rounded-md bg-black/50 p-2 text-white'>
                  <ImageIcon className='h-5 w-5' />
                  <span>{tAccount('banner.changeBanner')}</span>
                </div>
              </div>
            </div>
          </DialogTrigger>
        </div>
        <CardHeader className='-mt-10 pt-2 sm:-mt-12'>
          <div className='flex items-end gap-4'>
            <Dialog
              open={isAvatarEditorOpen}
              onOpenChange={setIsAvatarEditorOpen}
            >
              <DialogTrigger asChild>
                <div className='group relative cursor-pointer rounded-full border-4 border-card'>
                  <Avatar className='h-20 w-20 sm:h-24 sm:w-24'>
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
                    <Edit className='h-6 w-6 text-white' />
                  </div>
                </div>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{tAccount('editAvatarTitle')}</DialogTitle>
                  <DialogDescription>
                    {tAccount('editAvatarDescription')}
                  </DialogDescription>
                </DialogHeader>
                <AvatarEditor
                  user={user}
                  onUpdate={onUpdateAction}
                  onClose={() => setIsAvatarEditorOpen(false)}
                />
              </DialogContent>
            </Dialog>

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
                  tAccount('verification.resend')
                )}
              </Button>
            )}
          </div>
          <div className='flex items-center justify-between gap-4'>
            <div className='flex min-w-0 items-center gap-3'>
              <Phone className='h-5 w-5 flex-shrink-0 text-muted-foreground' />
              <span className='text-sm'>
                {user.phone_number || tAccount('display.notSet')}
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
                    tAccount('verification.resend')
                  )}
                </Button>
              ))}
          </div>
          <div className='flex items-start gap-3'>
            <Home className='mt-1 h-5 w-5 flex-shrink-0 text-muted-foreground' />
            <span className='flex-1'>
              {user.address || tAccount('display.notSet')}
            </span>
          </div>
          <div className='flex items-start gap-3'>
            <PersonStanding className='mt-1 h-5 w-5 flex-shrink-0 text-muted-foreground' />
            <span className='flex-1'>
              {user.gender || tAccount('display.notSet')}
            </span>
          </div>
          <div className='flex items-start gap-3'>
            <Cake className='mt-1 h-5 w-5 flex-shrink-0 text-muted-foreground' />
            <span className='flex-1'>
              {user.birthdate
                ? format(parseISO(user.birthdate), 'PPP')
                : tAccount('display.notSet')}
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
              {tAccount('display.aboutMeTitle')}
            </h4>
            <p className='whitespace-pre-wrap text-sm text-muted-foreground'>
              {user.aboutMe || tAccount('display.notSet')}
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
              {tAccount('display.status', { status: user.userStatus })}
            </span>
          </div>
          <div
            className='flex items-center gap-2'
            style={{ minHeight: '20px' }}
          >
            <CalendarDays className='h-4 w-4' />
            {memberSince && (
              <span>
                {tAccount('display.memberSince', { date: memberSince })}
              </span>
            )}
          </div>
        </CardFooter>
      </Card>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{tAccount('banner.editBannerTitle')}</DialogTitle>
          <DialogDescription>
            {tAccount('banner.editBannerDescription')}
          </DialogDescription>
        </DialogHeader>
        <BannerEditor
          user={user}
          onUpdate={onUpdateAction}
          onClose={() => setIsBannerEditorOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
