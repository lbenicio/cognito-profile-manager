'use client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Mail, Home, Phone, CalendarDays, BadgeCheck, Shield, Users, Globe, Clock, Languages, Edit } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useTranslations } from 'next-intl';
import type { User } from '@/lib/auth';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { useState } from 'react';
import { AvatarEditor } from './avatar-editor';

export function ProfileDisplay({ user, onUpdate }: { user: User, onUpdate: (data: Partial<User>) => void }) {
  const t = useTranslations('Dashboard');
  const tProfile = useTranslations('Profile.display');
  const tDashboard = useTranslations('Dashboard.profileCard');
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  return (
    <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <DialogTrigger asChild>
                <div className="relative group cursor-pointer">
                  <Avatar className="h-12 w-12 sm:h-16 sm:w-16">
                    <AvatarImage src={user.picture || ''} alt={user.name} data-ai-hint="profile picture" />
                    <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Edit className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                </div>
            </DialogTrigger>
            <div>
              <div className="flex items-center gap-2">
                  <CardTitle className="text-2xl font-headline">{user.name}</CardTitle>
                  {user.isAdmin ? (
                      <Badge><Shield className="w-3 h-3 mr-1"/>{tDashboard('adminBadge')}</Badge>
                  ) : (
                      <Badge variant="secondary">{tDashboard('userBadge')}</Badge>
                  )}
              </div>
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
          {user.website && (
              <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-muted-foreground" />
                  <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      {user.website}
                  </a>
              </div>
          )}
          {user.zoneinfo && (
              <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <span>{user.zoneinfo}</span>
              </div>
          )}
          {user.locale && (
              <div className="flex items-center gap-3">
                  <Languages className="w-5 h-5 text-muted-foreground" />
                  <span>{user.locale}</span>
              </div>
          )}
          <div className="flex items-start gap-3 pt-4 border-t">
            <Users className="w-5 h-5 text-muted-foreground mt-1 flex-shrink-0" />
            <div className="flex-1">
              <span className="font-semibold">{tDashboard('groups')}</span>
              <div className="flex flex-wrap gap-2 mt-2">
                  {user.groups.length > 0 ? user.groups.map(group => (
                      <Badge key={group} variant="outline">{group}</Badge>
                  )) : (
                      <span className="text-muted-foreground">{tDashboard('noGroups')}</span>
                  )}
              </div>
            </div>
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{tProfile('editAvatarTitle')}</DialogTitle>
          <DialogDescription>
            {tProfile('editAvatarDescription')}
          </DialogDescription>
        </DialogHeader>
        <AvatarEditor user={user} onUpdate={onUpdate} onClose={() => setIsEditorOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
