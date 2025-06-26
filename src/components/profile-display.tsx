import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Mail, Home, Phone, CalendarDays, BadgeCheck } from 'lucide-react';
import { format } from 'date-fns';

type User = {
  username: string;
  email: string;
  email_verified: boolean;
  name: string;
  address: string;
  phone_number: string;
  phone_number_verified: boolean;
  creationDate: string;
  userStatus: string;
};

export function ProfileDisplay({ user }: { user: User }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
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
        <div className="flex items-center gap-3">
          <Mail className="w-5 h-5 text-muted-foreground" />
          <span className="flex-1 truncate">{user.email}</span>
          {user.email_verified ? (
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">Verified</Badge>
          ) : (
            <Badge variant="destructive">Unverified</Badge>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Phone className="w-5 h-5 text-muted-foreground" />
          <span className="flex-1">{user.phone_number}</span>
          {user.phone_number_verified ? (
             <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">Verified</Badge>
          ) : (
            <Badge variant="destructive">Unverified</Badge>
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
            <span>Status: {user.userStatus}</span>
         </div>
         <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4" />
            <span>Member since: {format(new Date(user.creationDate), "MMMM d, yyyy")}</span>
         </div>
      </CardFooter>
    </Card>
  );
}
