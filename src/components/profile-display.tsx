import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Mail, Home, Phone, CalendarDays, BadgeCheck } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useTranslations } from 'next-intl';
import type { User } from '@/lib/auth';

export function ProfileDisplay({ user }: { user: User }) {
  const t = useTranslations('Dashboard');
  const tProfile = useTranslations('Profile.display');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12 sm:h-16 sm:w-16">
            <AvatarImage src={`https://placehold.co/128x128.png`} alt={user.name} data-ai-hint="profile picture" />
            <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-2xl font-headline">{user.name}</CardTitle>
            <CardDescription>@{user.username}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="flex flex-wrap items-center gap-2">
          <Mail className="w-5 h-5 text-muted-foreground" />
          <span className="flex-1 truncate min-w-0">{user.email}</span>
          {user.email_verified ? (
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 flex-shrink-0">{t('verified')}</Badge>
          ) : (
            <Badge variant="destructive" className="flex-shrink-0">{t('unverified')}</Badge>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Phone className="w-5 h-5 text-muted-foreground" />
          <span className="flex-1">{user.phone_number}</span>
          {user.phone_number_verified ? (
             <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 flex-shrink-0">{t('verified')}</Badge>
          ) : (
            <Badge variant="destructive" className="flex-shrink-0">{t('unverified')}</Badge>
          )}
        </div>
        <div className="flex items-start gap-3">
          <Home className="w-5 h-5 text-muted-foreground mt-1 flex-shrink-0" />
          <span className="flex-1">{user.address}</span>
        </div>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 pt-4 border-t text-xs text-muted-foreground">
         <div className="flex items-center gap-2">
            <BadgeCheck className="w-4 h-4" />
            <span>{tProfile('status', {status: user.userStatus})}</span>
         </div>
         <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4" />
            <span>{tProfile('memberSince', {date: format(parseISO(user.creationDate), "MMMM d, yyyy")})}</span>
         </div>
      </CardFooter>
    </Card>
  );
}
