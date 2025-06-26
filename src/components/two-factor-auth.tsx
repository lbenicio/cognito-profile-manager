'use client';

import { startRegistration } from '@simplewebauthn/browser';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Smartphone, KeyRound, Trash2, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from 'next-intl';
import type { User } from '@/lib/auth';
import { generateMfaSetup, verifyAndEnableMfa, disableMfa } from '@/lib/mfa-actions';
import {
    generateRegistrationOptionsServer,
    verifyRegistrationServer,
    removePasskey,
    listPasskeysForUser,
    type Passkey,
} from '@/lib/passkey-actions';
import { format } from 'date-fns';

type PasskeyListItem = Omit<Passkey, 'credentialPublicKey' | 'credentialID' | 'counter'>

export function TwoFactorAuth({ user }: { user: User }) {
    const { toast } = useToast();
    const t = useTranslations('Profile.twoFactor');

    // MFA/TOTP State
    const [showSetup, setShowSetup] = useState(false);
    const [qrCode, setQrCode] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isDisablingMfa, setIsDisablingMfa] = useState(false);

    // Passkeys State
    const [passkeys, setPasskeys] = useState<PasskeyListItem[]>([]);
    const [isAddingPasskey, setIsAddingPasskey] = useState(false);
    const [isRemovingPasskey, setIsRemovingPasskey] = useState<string | null>(null);
    const [isLoadingPasskeys, setIsLoadingPasskeys] = useState(true);

    useEffect(() => {
        const fetchPasskeys = async () => {
            try {
                setIsLoadingPasskeys(true);
                const userPasskeys = await listPasskeysForUser();
                setPasskeys(userPasskeys);
            } catch (error) {
                toast({ variant: 'destructive', title: 'Error', description: 'Could not load your passkeys.' });
            } finally {
                setIsLoadingPasskeys(false);
            }
        };
        fetchPasskeys();
    }, [toast]);

    const handleStartSetup = async () => {
        setIsGenerating(true);
        try {
            const { qrCodeDataUrl } = await generateMfaSetup();
            setQrCode(qrCodeDataUrl);
            setShowSetup(true);
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error instanceof Error ? error.message : 'Failed to start MFA setup.',
            });
        } finally {
            setIsGenerating(false);
        }
    }

    const handleCancelSetup = () => {
        setShowSetup(false);
        setQrCode('');
        setOtpCode('');
    }

    const handleVerifyOtp = async () => {
        setIsVerifying(true);
        try {
            const result = await verifyAndEnableMfa(otpCode);
            if (result.success) {
                toast({
                    title: t('otpSuccessTitle'),
                    description: t('otpSuccessDescription'),
                });
                setShowSetup(false);
                setQrCode('');
                setOtpCode('');
            } else {
                toast({
                    variant: 'destructive',
                    title: t('verificationFailedTitle'),
                    description: result.message,
                });
            }
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error instanceof Error ? error.message : 'An unknown error occurred.',
            });
        } finally {
            setIsVerifying(false);
        }
    };
    
    const handleDisableOtp = async () => {
        setIsDisablingMfa(true);
        try {
            const result = await disableMfa();
            if (result.success) {
                 toast({
                    title: t('mfaDisabledTitle'),
                    description: t('mfaDisabledDescription'),
                });
            }
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error instanceof Error ? error.message : 'Failed to disable MFA.',
            });
        } finally {
            setIsDisablingMfa(false);
        }
    };

    const handleAddPasskey = async () => {
        setIsAddingPasskey(true);
        try {
            const options = await generateRegistrationOptionsServer();
            const registrationResponse = await startRegistration(options);
            
            const passkeyName = prompt(t('nameYourPasskeyPrompt'), `Passkey - ${new Date().toLocaleDateString()}`);
            if (!passkeyName) {
                toast({ variant: 'default', title: t('addPasskeyCancelledTitle') });
                setIsAddingPasskey(false);
                return;
            }

            const verification = await verifyRegistrationServer(registrationResponse, passkeyName);

            if (verification.success) {
                toast({ title: t('passkeyAddedSuccessTitle'), description: verification.message });
                const userPasskeys = await listPasskeysForUser();
                setPasskeys(userPasskeys);
            } else {
                toast({ variant: 'destructive', title: t('passkeyAddedErrorTitle'), description: verification.message });
            }
        } catch (error: any) {
            console.error(error);
            const errorMessage = error.name === 'InvalidStateError' ? 'Authenticator was probably already registered' : error.message;
            toast({ variant: 'destructive', title: t('passkeyAddedErrorTitle'), description: errorMessage });
        } finally {
            setIsAddingPasskey(false);
        }
    };
    
    const handleRemovePasskey = async (id: string) => {
        setIsRemovingPasskey(id);
        try {
            const result = await removePasskey(id);
            if (result.success) {
                toast({ title: t('passkeyRemovedTitle'), description: result.message });
                setPasskeys(keys => keys.filter(key => key.name !== id));
            } else {
                toast({ variant: 'destructive', title: t('passkeyRemovedErrorTitle'), description: result.message });
            }
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to remove passkey.' });
        } finally {
            setIsRemovingPasskey(null);
        }
    };

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
                    <div className="flex items-start gap-3">
                        <Smartphone className="w-5 h-5 text-muted-foreground mt-1 flex-shrink-0" />
                        <div className='w-full'>
                            <h4 className="font-medium text-sm">{t('authenticatorApp')}</h4>
                             {user.twoFactorEnabled ? (
                                <div className="pt-2 space-y-2">
                                    <p className="text-sm text-green-700 dark:text-green-400">{t('statusEnabled')}</p>
                                    <Button variant="outline" size="sm" onClick={handleDisableOtp} disabled={isDisablingMfa}>
                                        {isDisablingMfa && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {t('disableButton')}
                                    </Button>
                                </div>
                            ) : (
                                <div className="pt-2 space-y-4">
                                    {!showSetup ? (
                                        <>
                                            <p className="text-sm text-muted-foreground">{t('statusDisabled')}</p>
                                            <Button variant="outline" size="sm" onClick={handleStartSetup} disabled={isGenerating}>
                                                {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                {t('enableButton')}
                                            </Button>
                                        </>
                                    ) : (
                                        <div className="space-y-4">
                                            <p className="text-sm text-muted-foreground">
                                                {t('qrInstructions')}
                                            </p>
                                            <div className="flex justify-start p-4 bg-white rounded-md w-fit">
                                                {qrCode ? (
                                                    <Image
                                                        src={qrCode}
                                                        alt="QR Code"
                                                        width={200}
                                                        height={200}
                                                        data-ai-hint="QR code"
                                                    />
                                                ) : (
                                                    <div className='w-[200px] h-[200px] flex items-center justify-center'>
                                                        <Loader2 className="h-10 w-10 animate-spin" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex gap-2 max-w-xs">
                                                <Input 
                                                    placeholder={t('codeInputPlaceholder')}
                                                    value={otpCode}
                                                    onChange={(e) => setOtpCode(e.target.value)}
                                                    maxLength={6}
                                                />
                                                <Button onClick={handleVerifyOtp} disabled={isVerifying || otpCode.length < 6}>
                                                    {isVerifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                    {t('verify')}
                                                </Button>
                                            </div>
                                            <Button variant="link" className="p-0 h-auto" onClick={handleCancelSetup}>{t('cancelButton')}</Button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Passkeys Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <KeyRound className="w-5 h-5 text-muted-foreground" />
                            <h4 className="font-medium text-sm">{t('passkeysTitle')}</h4>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleAddPasskey} disabled={isAddingPasskey}>
                            {isAddingPasskey && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t('addPasskey')}
                        </Button>
                    </div>
                     <div className="pl-8 space-y-3">
                        {isLoadingPasskeys ? (
                             <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>{t('loadingPasskeys')}</span>
                             </div>
                        ) : passkeys.length > 0 ? (
                            passkeys.map(key => (
                                <div key={key.name} className="flex items-center justify-between text-sm">
                                    <div className="flex flex-col">
                                        <span>{key.name}</span>
                                        <span className="text-xs text-muted-foreground">{t('addedOn', {date: format(new Date(key.createdAt), 'PP') })}</span>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleRemovePasskey(key.name)} disabled={!!isRemovingPasskey}>
                                        {isRemovingPasskey === key.name ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4"/>}
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
