'use client';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Globe,
  Mail,
  EyeOff,
  Phone,
  PersonStanding,
  Clock,
  Languages,
  Cake,
} from 'lucide-react';
import type { User } from '@/types/user/user.types';
import { format, parseISO } from 'date-fns';

export interface PublicProfileDisplayProps {
  user: User;
}

export function PublicProfileDisplay({ user }: PublicProfileDisplayProps) {
  const t = useTranslations('Profile.preview');
  const { isPublic, publicFields } = user.publicProfilePreferences;
  const hasContactFields =
    publicFields.email ||
    publicFields.website ||
    publicFields.phone_number ||
    publicFields.gender ||
    publicFields.zoneinfo ||
    publicFields.locale ||
    publicFields.birthdate;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent className='p-0'>
        <div className='bg-muted/40 p-6'>
          {!isPublic ? (
            <div className='text-muted-foreground flex min-h-[200px] flex-col items-center justify-center gap-4 text-center'>
              <EyeOff className='h-12 w-12' />
              <p className='font-medium'>{t('isPrivate')}</p>
            </div>
          ) : (
            <Card className='mx-auto max-w-md overflow-hidden shadow-md'>
              {publicFields.banner && user.banner && (
                <div className='relative'>
                  <Image
                    src={user.banner}
                    alt='User banner'
                    width={1500}
                    height={500}
                    className='h-32 w-full object-cover'
                    data-ai-hint='user banner'
                  />
                </div>
              )}
              <CardContent className='p-6'>
                <div className='flex flex-col items-center space-y-4 text-center'>
                  {publicFields.picture && (
                    <Avatar
                      className={`border-background h-24 w-24 border-4 ${publicFields.banner && user.banner ? '-mt-16' : ''}`}
                    >
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
                  )}
                  <div>
                    {publicFields.name && (
                      <h2 className='text-2xl font-bold'>{user.name}</h2>
                    )}
                    <p className='text-muted-foreground'>@{user.username}</p>
                  </div>

                  {publicFields.groups && user.groups.length > 0 && (
                    <div className='flex flex-wrap justify-center gap-2'>
                      {user.groups.map((group) => (
                        <Badge key={group} variant='secondary'>
                          {group}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className='w-full space-y-3 pt-4'>
                    {publicFields.aboutMe && user.aboutMe && (
                      <>
                        <Separator />
                        <p className='text-muted-foreground pt-4 text-center text-sm whitespace-pre-wrap'>
                          {user.aboutMe}
                        </p>
                      </>
                    )}

                    {hasContactFields && <Separator />}

                    <div className='flex w-full flex-col items-start gap-3 text-left'>
                      {publicFields.email && (
                        <div className='flex items-center gap-2 text-sm'>
                          <Mail className='text-muted-foreground h-4 w-4' />
                          <a
                            href={`mailto:${user.email}`}
                            className='text-primary hover:underline'
                          >
                            {user.email}
                          </a>
                        </div>
                      )}
                      {publicFields.website && user.website && (
                        <div className='flex items-center gap-2 text-sm'>
                          <Globe className='text-muted-foreground h-4 w-4' />
                          <a
                            href={user.website}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-primary hover:underline'
                          >
                            {user.website.replace(/^(https?:\/\/)/, '')}
                          </a>
                        </div>
                      )}
                      {publicFields.phone_number && user.phone_number && (
                        <div className='flex items-center gap-2 text-sm'>
                          <Phone className='text-muted-foreground h-4 w-4' />
                          <span>{user.phone_number}</span>
                        </div>
                      )}
                      {publicFields.gender && user.gender && (
                        <div className='flex items-center gap-2 text-sm'>
                          <PersonStanding className='text-muted-foreground h-4 w-4' />
                          <span>{user.gender}</span>
                        </div>
                      )}
                      {publicFields.birthdate && user.birthdate && (
                        <div className='flex items-center gap-2 text-sm'>
                          <Cake className='text-muted-foreground h-4 w-4' />
                          <span>{format(parseISO(user.birthdate), 'PPP')}</span>
                        </div>
                      )}
                      {publicFields.zoneinfo && user.zoneinfo && (
                        <div className='flex items-center gap-2 text-sm'>
                          <Clock className='text-muted-foreground h-4 w-4' />
                          <span>{user.zoneinfo}</span>
                        </div>
                      )}
                      {publicFields.locale && user.locale && (
                        <div className='flex items-center gap-2 text-sm'>
                          <Languages className='text-muted-foreground h-4 w-4' />
                          <span>{user.locale}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
