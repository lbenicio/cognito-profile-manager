'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Smartphone, KeyRound, Loader2, Plus, Trash2, Laptop, Monitor, Copy } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from 'next-intl';
import type { User } from '@/lib/auth';
import { generateMfaSetup, verifyAndEnableMfa, disableMfa } from '@/lib/mfa-actions';
import {
  generateRegistrationOptionsServer,
  listPasskeysForUser,
  removePasskey,
  verifyRegistrationServer,
  type Passkey,
} from '@/lib/passkey-actions';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from './ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import type { RegistrationResponseJSON } from '@simplewebauthn/types';
import { Label } from './ui/label';
import { format } from 'date-fns';

// Helper functions to bridge the gap between JSON and the WebAuthn API's ArrayBuffers
function base64UrlToArrayBuffer(base64url: string): ArrayBuffer {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const binStr = atob(base64);
  const bin = new Uint8Array(binStr.length);
  for (let i = 0; i < binStr.length; i++) {
    bin[i] = binStr.charCodeAt(i);
  }
  return bin.buffer;
}

function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
  const bin = new Uint8Array(buffer);
  let binStr = '';
  bin.forEach((byte) => {
    binStr += String.fromCharCode(byte);
  });
  const base64 = btoa(binStr);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

interface TwoFactorAuthProps {
    user: User;
    onUpdate: (data: Partial<User>) => void;
}

export function TwoFactorAuth({ user, onUpdate }: TwoFactorAuthProps) {
    const { toast } = useToast();
    const t = useTranslations('Profile.twoFactor');

    // MFA/TOTP State
    const [showSetup, setShowSetup] = useState(false);
    const [qrCode, setQrCode] = useState('');
    const [secret, setSecret] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isDisablingMfa, setIsDisablingMfa] = useState(false);

    // Passkey State
    const [passkeys, setPasskeys] = useState<Omit<Passkey, 'credentialPublicKey' | 'credentialID' | 'counter'>[]>([]);
    const [isLoadingPasskeys, setIsLoadingPasskeys] = useState(true);
    const [isAddingPasskey, setIsAddingPasskey] = useState(false);
    const [isRemovingPasskey, setIsRemovingPasskey] = useState<string | null>(null);
    const [newPasskeyName, setNewPasskeyName] = useState('');
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [passkeyToRemove, setPasskeyToRemove] = useState<string | null>(null);

    const fetchPasskeys = async () => {
        setIsLoadingPasskeys(true);
        try {
            const userPasskeys = await listPasskeysForUser();
            setPasskeys(userPasskeys);
        } catch (error) {
            toast({
                variant: 'destructive',
                title: t('passkeyError.listTitle'),
                description: error instanceof Error ? error.message : t('passkeyError.listError'),
            });
        } finally {
            setIsLoadingPasskeys(false);
        }
    };

    useEffect(() => {
        fetchPasskeys();
    }, []);

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

    const handleAddPasskey = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPasskeyName) return;
        setIsAddingPasskey(true);
        try {
            const options = await generateRegistrationOptionsServer();
            
            const clientOptions = {
                ...options,
                challenge: base64UrlToArrayBuffer(options.challenge),
                user: {
                    ...options.user,
                    id: base64UrlToArrayBuffer(options.user.id),
                },
                excludeCredentials: options.excludeCredentials?.map(c => ({
                    ...c,
                    id: base64UrlToArrayBuffer(c.id as string)
                })),
            };

            const credential = await navigator.credentials.create({ publicKey: clientOptions });

            if (!credential) throw new Error('Passkey creation was cancelled.');

            const responseJSON: RegistrationResponseJSON = {
                id: credential.id,
                rawId: arrayBufferToBase64Url(credential.rawId),
                type: credential.type as 'public-key',
                response: {
                    attestationObject: arrayBufferToBase64Url((credential.response as any).attestationObject),
                    clientDataJSON: arrayBufferToBase64Url(credential.response.clientDataJSON),
                },
                clientExtensionResults: (credential as any).getClientExtensionResults(),
            };

            const result = await verifyRegistrationServer(responseJSON, newPasskeyName);
            
            if (result.success) {
                toast({ title: t('passkeySuccess.addTitle'), description: result.message });
                onUpdate({ passkeysEnabled: true });
                await fetchPasskeys();
                setIsAddDialogOpen(false);
                setNewPasskeyName('');
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            toast({
                variant: 'destructive',
                title: t('passkeyError.addTitle'),
                description: error instanceof Error ? error.message : t('passkeyError.addError'),
            });
        } finally {
            setIsAddingPasskey(false);
        }
    };

    const handleRemovePasskey = async (passkeyId: string) => {
        setIsRemovingPasskey(passkeyId);
        try {
            const result = await removePasskey(passkeyId);
            if (result.success) {
                toast({ title: t('passkeySuccess.removeTitle'), description: result.message });
                const updatedPasskeys = passkeys.filter(p => p.id !== passkeyId);
                setPasskeys(updatedPasskeys);
                if (updatedPasskeys.length === 0) {
                    onUpdate({ passkeysEnabled: false });
                }
            } else {
                 throw new Error(result.message);
            }
        } catch (error) {
             toast({
                variant: 'destructive',
                title: t('passkeyError.removeTitle'),
                description: error instanceof Error ? error.message : t('passkeyError.removeError'),
            });
        } finally {
            setIsRemovingPasskey(null);
            setPasskeyToRemove(null);
        }
    }

    const getDeviceIcon = (transports?: AuthenticatorTransport[]) => {
        if (!transports || transports.length === 0) return <Laptop className="w-5 h-5 text-muted-foreground" />;
        if (transports.includes('internal')) return <Laptop className="w-5 h-5 text-muted-foreground" />;
        if (transports.includes('hybrid') || transports.includes('usb')) return <KeyRound className="w-5 h-5 text-muted-foreground" />;
        return <Monitor className="w-5 h-5 text-muted-foreground" />;
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
                            {isLoadingPasskeys ? (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>{t('passkeyLoading')}</span>
                                </div>
                            ) : passkeys.length > 0 ? (
                                <ul className="space-y-3">
                                    {passkeys.map(key => (
                                        <li key={key.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                                            <div className="flex items-center gap-3">
                                                {getDeviceIcon(key.transports)}
                                                <div>
                                                    <p className="font-medium text-sm">{key.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {t('passkeyAddedOn', {date: format(new Date(key.createdAt), 'MMM d, yyyy')})}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="icon" onClick={() => setPasskeyToRemove(key.id)} disabled={isRemovingPasskey === key.id}>
                                                {isRemovingPasskey === key.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-destructive" />}
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-muted-foreground">{t('noPasskeys')}</p>
                            )}

                             <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        <Plus className="mr-2 h-4 w-4"/> {t('addPasskeyButton')}
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <form onSubmit={handleAddPasskey}>
                                        <DialogHeader>
                                            <DialogTitle>{t('addPasskeyTitle')}</DialogTitle>
                                            <DialogDescription>{t('addPasskeyDescription')}</DialogDescription>
                                        </DialogHeader>
                                        <div className="py-4">
                                            <Label htmlFor="passkey-name">{t('passkeyNameLabel')}</Label>
                                            <Input 
                                                id="passkey-name"
                                                value={newPasskeyName}
                                                onChange={(e) => setNewPasskeyName(e.target.value)}
                                                placeholder={t('passkeyNamePlaceholder')}
                                                required
                                                className="mt-2"
                                            />
                                        </div>
                                        <DialogFooter>
                                             <DialogClose asChild>
                                                <Button type="button" variant="outline">{t('cancelButton')}</Button>
                                            </DialogClose>
                                            <Button type="submit" disabled={isAddingPasskey || !newPasskeyName}>
                                                {isAddingPasskey && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                                {t('addPasskeySubmit')}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </div>
            </CardContent>

             <AlertDialog open={!!passkeyToRemove} onOpenChange={(isOpen) => !isOpen && setPasskeyToRemove(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('passkeyRemove.title')}</AlertDialogTitle>
                        <AlertDialogDescription>
                           {t('passkeyRemove.description')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('cancelButton')}</AlertDialogCancel>
                        <AlertDialogAction onClick={() => passkeyToRemove && handleRemovePasskey(passkeyToRemove)}>
                            {t('passkeyRemove.confirm')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    )
}
