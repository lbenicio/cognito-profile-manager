'use client';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Globe, Mail, EyeOff, Home, Phone, PersonStanding, Clock, Languages } from 'lucide-react';
import type { User } from '@/lib/auth';

interface PublicProfileDisplayProps {
  user: User;
}

export function PublicProfileDisplay({ user }: PublicProfileDisplayProps) {
  const t = useTranslations('Profile.preview');
  const { isPublic, publicFields } = user.publicProfilePreferences;
  const hasAnyPublicField = Object.values(publicFields).some(Boolean);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="bg-muted/40 p-6">
          {!isPublic ? (
            <div className="flex flex-col items-center justify-center text-center text-muted-foreground min-h-[200px] gap-4">
              <EyeOff className="w-12 h-12" />
              <p className="font-medium">{t('isPrivate')}</p>
            </div>
          ) : (
            <Card className="max-w-md mx-auto shadow-md">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={user.picture || ''} alt={user.name} data-ai-hint="profile picture" />
                    <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-2xl font-bold">{user.name}</h2>
                    <p className="text-muted-foreground">@{user.username}</p>
                  </div>

                  {user.groups.length > 0 && (
                     <div className="flex flex-wrap gap-2 justify-center">
                        {user.groups.map(group => (
                            <Badge key={group} variant="secondary">{group}</Badge>
                        ))}
                    </div>
                  )}
                 
                  <div className="w-full pt-4 space-y-3">
                    {publicFields.aboutMe && user.aboutMe && (
                      <>
                        <Separator />
                        <p className="text-sm text-center text-muted-foreground pt-4 whitespace-pre-wrap">
                          {user.aboutMe}
                        </p>
                      </>
                    )}
                    
                    {hasAnyPublicField && <Separator />}

                     <div className='flex flex-col items-start text-left gap-3 w-full'>
                        {publicFields.email && (
                             <div className="flex items-center gap-2 text-sm">
                                <Mail className="w-4 h-4 text-muted-foreground" />
                                <a href={`mailto:${user.email}`} className="text-primary hover:underline">
                                    {user.email}
                                </a>
                            </div>
                        )}
                        {publicFields.website && user.website && (
                            <div className="flex items-center gap-2 text-sm">
                                <Globe className="w-4 h-4 text-muted-foreground" />
                                <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                    {user.website.replace(/^(https?:\/\/)/, '')}
                                </a>
                            </div>
                        )}
                        {publicFields.phone_number && user.phone_number && (
                            <div className="flex items-center gap-2 text-sm">
                                <Phone className="w-4 h-4 text-muted-foreground" />
                                <span>{user.phone_number}</span>
                            </div>
                        )}
                         {publicFields.gender && user.gender && (
                            <div className="flex items-center gap-2 text-sm">
                                <PersonStanding className="w-4 h-4 text-muted-foreground" />
                                <span>{user.gender}</span>
                            </div>
                        )}
                        {publicFields.zoneinfo && user.zoneinfo && (
                            <div className="flex items-center gap-2 text-sm">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                <span>{user.zoneinfo}</span>
                            </div>
                        )}
                        {publicFields.locale && user.locale && (
                            <div className="flex items-center gap-2 text-sm">
                                <Languages className="w-4 h-4 text-muted-foreground" />
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
