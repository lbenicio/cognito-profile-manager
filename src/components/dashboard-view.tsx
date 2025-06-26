'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, KeyRound, Palette, ShieldCheck, User } from 'lucide-react';
import type { User as UserType } from '@/lib/auth';

interface DashboardViewProps {
  user: UserType;
}

export function DashboardView({ user }: DashboardViewProps) {
  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Welcome back, {user.name}!</h1>
        <p className="text-muted-foreground text-lg">
          Here's a quick overview of your Outpost account.
        </p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center gap-4">
             <Avatar className="h-16 w-16">
                <AvatarImage src={`https://placehold.co/128x128.png`} alt={user.name} data-ai-hint="profile picture" />
                <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
             </Avatar>
             <div>
                <CardTitle>{user.name}</CardTitle>
                <CardDescription>@{user.username}</CardDescription>
             </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-2"><User className="h-4 w-4" /> Email</span>
                    <div className="flex items-center gap-2">
                        <span>{user.email}</span>
                        {user.email_verified ? (
                            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">Verified</Badge>
                        ) : (
                            <Badge variant="destructive">Unverified</Badge>
                        )}
                    </div>
                </div>
                 <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> 2FA Status</span>
                    {user.twoFactorEnabled ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">Enabled</Badge>
                    ) : (
                        <Badge variant="destructive">Disabled</Badge>
                    )}
                </div>
            </div>
          </CardContent>
           <div className="p-6 pt-0">
             <Button asChild>
                <Link href="/profile">Manage Profile <ArrowRight className="ml-2 h-4 w-4" /></Link>
             </Button>
           </div>
        </Card>

        {/* Quick Actions Card */}
        <Card>
            <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Commonly used settings and actions.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                <Button variant="outline" className="justify-start" asChild>
                    <Link href="/profile">
                        <KeyRound /> Change Password
                    </Link>
                </Button>
                 <Button variant="outline" className="justify-start" asChild>
                    <Link href="/profile">
                        <ShieldCheck /> Manage Security
                    </Link>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                    <Link href="/settings">
                        <Palette /> Appearance Settings
                    </Link>
                </Button>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
