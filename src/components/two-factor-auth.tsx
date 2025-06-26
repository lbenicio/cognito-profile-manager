'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Smartphone, KeyRound, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from 'next-intl';

const mockPasskeys = [
    { id: '1', name: 'MacBook Pro Touch ID', added: '2023-10-26' },
    { id: '2', name: 'YubiKey 5C', added: '2023-09-15' },
];

export function TwoFactorAuth() {
    const { toast } = useToast();
    const t = useTranslations('Profile.twoFactor');
    const [isOtpEnabled, setIsOtpEnabled] = useState(false);
    const [passkeys, setPasskeys] = useState(mockPasskeys);
    const [otpCode, setOtpCode] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);

    const handleEnableOtp = (enabled: boolean) => {
        setIsOtpEnabled(enabled);
        if (!enabled) {
            setOtpCode('');
        }
    }

    const handleVerifyOtp = async () => {
        setIsVerifying(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        if(otpCode === '123456') {
            toast({
                title: t('otpSuccessTitle'),
                description: t('otpSuccessDescription'),
            });
        } else {
            toast({
                variant: 'destructive',
                title: t('verificationFailedTitle'),
                description: t('verificationFailedDescription'),
            });
        }
        setIsVerifying(false);
    }

    const handleAddPasskey = () => {
        toast({
            title: t('addPasskeyToastTitle'),
            description: t('addPasskeyToastDescription'),
        });
        // In a real app, this would trigger the WebAuthn API
    }
    
    const handleRemovePasskey = (id: string) => {
        setPasskeys(passkeys.filter(key => key.id !== id));
        toast({
            title: t('passkeyRemovedTitle'),
            description: t('passkeyRemovedDescription'),
        });
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('title')}</CardTitle>
                <CardDescription>
                    {t('description')}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Authenticator App Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Smartphone className="w-5 h-5 text-muted-foreground" />
                            <label htmlFor="otp-switch" className="font-medium text-sm">{t('authenticatorApp')}</label>
                        </div>
                        <Switch id="otp-switch" checked={isOtpEnabled} onCheckedChange={handleEnableOtp} />
                    </div>
                    {isOtpEnabled && (
                        <div className="pl-8 space-y-4 pt-2 border-l-2 border-muted/50 ml-2.5">
                            <p className="text-sm text-muted-foreground">
                                {t('qrInstructions')}
                            </p>
                            <div className="flex justify-center p-4 bg-white rounded-md w-fit mx-auto">
                                <Image
                                    src="https://placehold.co/200x200.png"
                                    alt="QR Code Placeholder"
                                    width={200}
                                    height={200}
                                    data-ai-hint="QR code"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Input 
                                    placeholder={t('codeInputPlaceholder')}
                                    value={otpCode}
                                    onChange={(e) => setOtpCode(e.target.value)}
                                    maxLength={6}
                                />
                                <Button onClick={handleVerifyOtp} disabled={isVerifying || otpCode.length < 6}>
                                    {isVerifying ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
                                    ) : (
                                        t('verify')
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                <Separator />

                {/* Passkeys Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <KeyRound className="w-5 h-5 text-muted-foreground" />
                            <h4 className="font-medium text-sm">{t('passkeysTitle')}</h4>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleAddPasskey}>
                            {t('addPasskey')}
                        </Button>
                    </div>
                     <div className="pl-8 space-y-3">
                        {passkeys.length > 0 ? (
                            passkeys.map(key => (
                                <div key={key.id} className="flex items-center justify-between text-sm">
                                    <div className="flex flex-col">
                                        <span>{key.name}</span>
                                        <span className="text-xs text-muted-foreground">{t('addedOn', {date: key.added})}</span>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleRemovePasskey(key.id)}>
                                        <Trash2 className="h-4 w-4"/>
                                        <span className="sr-only">{t('removePasskey')}</span>
                                    </Button>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground">{t('noPasskeys')}</p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
