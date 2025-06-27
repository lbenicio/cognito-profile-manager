
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Smartphone, KeyRound, Loader2, Copy } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from 'next-intl';
import type { User } from '@/lib/auth';
import { generateMfaSetup, verifyAndEnableMfa, disableMfa } from '@/lib/mfa-actions';

interface TwoFactorAuthProps {
    user: User;
    onUpdate: (data: Partial<User>) => void;
}

export function TwoFactorAuth({ user, onUpdate }: TwoFactorAuthProps) {
    const { toast } = useToast();
    const t = useTranslations('Profile.twoFactor');
    const searchParams = useSearchParams();
    const router = useRouter();

    // MFA/TOTP State
    const [showSetup, setShowSetup] = useState(false);
    const [qrCode, setQrCode] = useState('');
    const [secret, setSecret] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isDisablingMfa, setIsDisablingMfa] = useState(false);

    // Passkey State
    const [isManagingPasskeys, setIsManagingPasskeys] = useState(false);

    useEffect(() => {
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        const result = searchParams.get('result');
        const currentPath = window.location.pathname;

        if (error) {
            toast({
                variant: 'destructive',
                title: t('passkeyError.title'),
                description: errorDescription || t('passkeyError.generic'),
            });
            // Clear the query params from URL to prevent toast on refresh
            window.history.replaceState(null, '', currentPath);
        }

        if (result === 'success') {
            toast({
                title: t('passkeySuccess.title'),
                description: t('passkeySuccess.description'),
            });
            onUpdate({ passkeysEnabled: true });
            // Clear the query params and refresh data from server
            window.history.replaceState(null, '', currentPath);
            router.refresh();
        }
    }, [searchParams, toast, t, router, onUpdate]);

    const handleStartSetup = async () => {
        setIsGenerating(true);
        try {
            const { qrCodeDataUrl, secretCode } = await generateMfaSetup();
            setQrCode(qrCodeDataUrl);
            setSecret(secretCode);
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
        setSecret('');
    }

    const handleCopySecret = () => {
        if (!secret) return;
        navigator.clipboard.writeText(secret).then(() => {
            toast({
                title: t('secretCopiedTitle'),
                description: t('secretCopiedDescription'),
            });
        });
    };

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
                setSecret('');
                onUpdate({ twoFactorEnabled: true });
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
                onUpdate({ twoFactorEnabled: false });
            } else {
                throw new Error(result.message);
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
        setIsManagingPasskeys(true);
        try {
            const wellknownUrl = process.env.NEXT_PUBLIC_COGNITO_WELLKNOWN;
            const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
            const scope = process.env.NEXT_PUBLIC_OAUTH2_SCOPE;

            if (!wellknownUrl || !clientId || !scope) {
                throw new Error(t('passkeyError.configMissing'));
            }
            
            const wellknownResponse = await fetch(wellknownUrl, { cache: 'no-store' });
            if (!wellknownResponse.ok) throw new Error('Failed to fetch OpenID configuration');
            const wellknown = await wellknownResponse.json();
            const authorizationEndpoint = wellknown.authorization_endpoint;

            const cognitoDomain = new URL(authorizationEndpoint).origin;
            const passkeyUrl = new URL(`${cognitoDomain}/passkeys/add`);
            
            // The new callback URL specific to this action
            const passkeyCallbackUrl = new URL('/api/v1/auth/callback/passkey', window.location.origin).toString();

            // --- CSRF protection ---
            const state = Array.from(window.crypto.getRandomValues(new Uint8Array(16)), byte => byte.toString(16).padStart(2, '0')).join('');
            document.cookie = `oauth_state=${state}; path=/; max-age=600; secure=${window.location.protocol === 'https:'}; samesite=lax`;

            passkeyUrl.searchParams.set('client_id', clientId);
            passkeyUrl.searchParams.set('response_type', 'code');
            passkeyUrl.searchParams.set('scope', scope);
            passkeyUrl.searchParams.set('redirect_uri', passkeyCallbackUrl);
            passkeyUrl.searchParams.set('state', state);

            window.location.href = passkeyUrl.toString();

        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: t('passkeyError.title'),
                description: error.message || t('passkeyError.generic'),
            });
            setIsManagingPasskeys(false);
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
                <div className="space-y-2">
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

                                            <div className="space-y-2">
                                                <p className="text-sm text-muted-foreground">{t('manualEntryInstructions')}</p>
                                                <div className="flex items-center gap-2 max-w-xs">
                                                    <Input 
                                                        readOnly 
                                                        value={secret} 
                                                        className="font-mono text-sm bg-muted/50" 
                                                        aria-label={t('copyKeyLabel')}
                                                    />
                                                    <Button 
                                                        type="button"
                                                        variant="outline" 
                                                        size="icon" 
                                                        onClick={handleCopySecret}
                                                        aria-label={t('copyKeyLabel')}
                                                    >
                                                        <Copy className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>

                                            <Separator />

                                            <div className="space-y-2">
                                                <p className="text-sm font-medium">{t('verifyTitle')}</p>
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
                    <div className="flex items-start gap-3">
                        <KeyRound className="w-5 h-5 text-muted-foreground mt-1 flex-shrink-0" />
                        <div className="w-full space-y-4">
                            <h4 className="font-medium text-sm">{t('passkeysTitle')}</h4>
                             {user.passkeysEnabled ? (
                                <p className="text-sm text-green-700 dark:text-green-400">{t('passkeysEnabled')}</p>
                            ) : (
                                <p className="text-sm text-muted-foreground">{t('passkeysDisabled')}</p>
                            )}
                            <p className="text-sm text-muted-foreground">
                                {t('passkeysDescription')}
                            </p>
                            <Button variant="outline" size="sm" onClick={handleAddPasskey} disabled={isManagingPasskeys}>
                                {isManagingPasskeys && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {t('addPasskeyButton')}
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
