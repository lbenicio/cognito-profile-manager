'use client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Mail, Home, Phone, CalendarDays, BadgeCheck, Shield, Users, Globe, Clock, Languages, Edit, PersonStanding, BookUser } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useTranslations } from 'next-intl';
import type { User } from '@/lib/auth';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { useState, useEffect } from 'react';
import { AvatarEditor } from './avatar-editor';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { Separator } from './ui/separator';

export function AccountDisplay({ user, onUpdate }: { user: User, onUpdate: (data: Partial<User>) => void }) {
  const t = useTranslations('Dashboard');
  const tAccount = useTranslations('Account');
  const tDashboard = useTranslations('Dashboard.profileCard');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [memberSince, setMemberSince] = useState<string | null>(null);

  // Logic for verification actions
  const { toast } = useToast();
  const [emailLoading, setEmailLoading] = useState(false);
  const [phoneLoading, setPhoneLoading] = useState(false);

  useEffect(() => {
    if (user.creationDate) {
        setMemberSince(format(parseISO(user.creationDate), "MMMM d, yyyy"));
    }
  }, [user.creationDate]);

  const handleSendVerificationEmail = async () => {
    setEmailLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({
        title: tAccount('verification.sentTitle'),
        description: tAccount('verification.emailSentDescription', {email: user.email}),
    });
    setEmailLoading(false);
  };
    
  const handleSendVerificationSms = async () => {
      setPhoneLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
          title: tAccount('verification.sentTitle'),
          description: tAccount('verification.phoneSentDescription', {phone: user.phone_number}),
      });
      setPhoneLoading(false);
  };

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
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <Mail className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <span className="truncate">{user.email}</span>
            </div>
              {user.email_verified ? (
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 flex items-center gap-1 flex-shrink-0">
                  <BadgeCheck className="w-3.5 h-3.5"/>
                  {t('verified')}
                </Badge>
              ) : (
                <Button variant="outline" size="sm" onClick={handleSendVerificationEmail} disabled={emailLoading} className='flex-shrink-0'>
                  {emailLoading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div> : tAccount('verification.resend')}
                </Button>
              )}
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <Phone className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <span className="text-sm">{user.phone_number || tAccount('display.notSet')}</span>
            </div>
              {user.phone_number && (
                 user.phone_number_verified ? (
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 flex items-center gap-1 flex-shrink-0">
                    <BadgeCheck className="w-3.5 h-3.5"/>
                    {t('verified')}
                  </Badge>
                ) : (
                  <Button variant="outline" size="sm" onClick={handleSendVerificationSms} disabled={phoneLoading} className='flex-shrink-0'>
                    {phoneLoading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div> : tAccount('verification.resend')}
                  </Button>
                )
              )}
          </div>
          <div className="flex items-start gap-3">
            <Home className="w-5 h-5 text-muted-foreground mt-1 flex-shrink-0" />
            <span className="flex-1">{user.address || tAccount('display.notSet')}</span>
          </div>
          <div className="flex items-start gap-3">
            <PersonStanding className="w-5 h-5 text-muted-foreground mt-1 flex-shrink-0" />
            <span className="flex-1">{user.gender || tAccount('display.notSet')}</span>
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
           <Separator className="my-4" />
           <div className="space-y-2">
                <h4 className="font-semibold">{tAccount('display.aboutMeTitle')}</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {user.aboutMe || tAccount('display.notSet')}
                </p>
            </div>
           <Separator className="my-4" />
          <div className="flex items-start gap-3">
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
              <span>{tAccount('display.status', {status: user.userStatus})}</span>
          </div>
          <div className="flex items-center gap-2" style={{minHeight: '20px'}}>
              <CalendarDays className="w-4 h-4" />
              {memberSince && (
                <span>{tAccount('display.memberSince', {date: memberSince})}</span>
              )}
          </div>
        </CardFooter>
      </Card>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{tAccount('editAvatarTitle')}</DialogTitle>
          <DialogDescription>
            {tAccount('editAvatarDescription')}
          </DialogDescription>
        </DialogHeader>
        <AvatarEditor user={user} onUpdate={onUpdate} onClose={() => setIsEditorOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
