'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Mail, Phone } from 'lucide-react';
import React from 'react';
import type { User } from '@/lib/auth';
import { useTranslations } from 'next-intl';


export function Verification({ user }: { user: User }) {
    const { toast } = useToast();
    const t = useTranslations('Profile.verification');
    const [emailLoading, setEmailLoading] = React.useState(false);
    const [phoneLoading, setPhoneLoading] = React.useState(false);

    const handleSendVerificationEmail = async () => {
        setEmailLoading(true);
        // In a real app, this would trigger an API call to Cognito to send a verification email.
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast({
            title: t('sentTitle'),
            description: t('emailSentDescription', {email: user.email}),
        });
        setEmailLoading(false);
    };
    
    const handleSendVerificationSms = async () => {
        setPhoneLoading(true);
        // In a real app, this would trigger an API call to Cognito to send a verification SMS.
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast({
            title: t('sentTitle'),
            description: t('phoneSentDescription', {phone: user.phone_number}),
        });
        setPhoneLoading(false);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('title')}</CardTitle>
                <CardDescription>{t('description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <Mail className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm truncate">{user.email}</span>
                    </div>
                    {!user.email_verified && (
                        <Button variant="outline" size="sm" onClick={handleSendVerificationEmail} disabled={emailLoading} className='flex-shrink-0'>
                            {emailLoading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div> : t('verify')}
                        </Button>
                    )}
                </div>
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <Phone className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm">{user.phone_number}</span>
                    </div>
                    {!user.phone_number_verified && (
                        <Button variant="outline" size="sm" onClick={handleSendVerificationSms} disabled={phoneLoading} className='flex-shrink-0'>
                           {phoneLoading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div> : t('verify')}
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
