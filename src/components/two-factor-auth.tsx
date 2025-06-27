
'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Smartphone, KeyRound, Loader2, Copy, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from 'next-intl';
import type { User } from '@/lib/auth';
import { generateMfaSetup, verifyAndEnableMfa, disableMfa } from '@/lib/mfa-actions';
import { deletePasskey } from '@/lib/passkey-actions';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';


interface TwoFactorAuthProps {
    user: User;
    onUpdate: (data: Partial<User>) => void;
}

export function TwoFactorAuth({ user, onUpdate }: TwoFactorAuthProps) {
    const { toast } = useToast();
    const t = useTranslations('Security.twoFactor');
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

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
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    useEffect(() => {
        const result = searchParams.get('result');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        if (error || result) {
            // Clean the URL to prevent the toast from re-appearing on refresh.
            const currentPath = window.location.pathname;
            window.history.replaceState(null, '', currentPath);

            if (error) {
                toast({
                    variant: 'destructive',
                    title: t('passkeyError.title'),
                    description: errorDescription || t('passkeyError.generic'),
                });
            }

            if (result === 'success') {
                toast({
                    title: t('passkeySuccess.title'),
                    description: t('passkeySuccess.description'),
                });
                router.refresh();
            }
        }
    }, [searchParams, router, t, toast]);

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

    const handleAddPasskey = () => {
        setIsManagingPasskeys(true);
        window.location.href = '/api/v1/auth/passkey/start';
    };

    const handleDeletePasskey = (key: string) => {
        startTransition(async () => {
            setIsDeleting(key);
            const result = await deletePasskey(key);
            if (result.success) {
                toast({
                    title: 'Passkey Deleted',
                    description: 'The selected passkey has been removed from your account.',
                });
                router.refresh();
            } else {
                 toast({
                    variant: 'destructive',
                    title: 'Deletion Failed',
                    description: result.message,
                });
            }
            setIsDeleting(null);
        });
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
                            <p className="text-sm text-muted-foreground">
                                {t('passkeysDescription')}
                            </p>

                             {user.devices && user.devices.length > 0 ? (
                                <div className="space-y-4">
                                    <p className="text-sm text-green-700 dark:text-green-400">{t('passkeysEnabled')}</p>
                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>{t('passkeyTable.name')}</TableHead>
                                                    <TableHead>{t('passkeyTable.addedOn')}</TableHead>
                                                    <TableHead className="text-right">{t('passkeyTable.actions')}</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {user.devices.map((device) => (
                                                    <TableRow key={device.key}>
                                                        <TableCell className="font-medium">
                                                            <div className="flex items-center gap-2">
                                                                <KeyRound className="h-4 w-4 text-muted-foreground" />
                                                                <span>{device.name}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>{device.createDate ? format(new Date(device.createDate), "PPP") : 'N/A'}</TableCell>
                                                        <TableCell className="text-right">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleDeletePasskey(device.key)}
                                                                disabled={isPending && isDeleting === device.key}
                                                                aria-label={`Delete passkey ${device.name}`}
                                                            >
                                                                {isPending && isDeleting === device.key ? (
                                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                                ) : (
                                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                                )}
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">{t('passkeysDisabled')}</p>
                            )}

                            <Button variant="outline" size="sm" onClick={handleAddPasskey} disabled={isManagingPasskeys || isPending}>
                                {(isManagingPasskeys || isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {t('addPasskeyButton')}
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

    
