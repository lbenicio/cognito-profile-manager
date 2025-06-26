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

const mockPasskeys = [
    { id: '1', name: 'MacBook Pro Touch ID', added: '2023-10-26' },
    { id: '2', name: 'YubiKey 5C', added: '2023-09-15' },
];

export function TwoFactorAuth() {
    const { toast } = useToast();
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
                title: 'Authenticator App Enabled',
                description: '2FA via authenticator app has been successfully enabled.',
            });
        } else {
            toast({
                variant: 'destructive',
                title: 'Verification Failed',
                description: 'The code is incorrect. Please try again.',
            });
        }
        setIsVerifying(false);
    }

    const handleAddPasskey = () => {
        toast({
            title: 'Add Passkey',
            description: 'Follow your browser instructions to add a new passkey.',
        });
        // In a real app, this would trigger the WebAuthn API
    }
    
    const handleRemovePasskey = (id: string) => {
        setPasskeys(passkeys.filter(key => key.id !== id));
        toast({
            title: 'Passkey Removed',
            description: 'The selected passkey has been removed.',
        });
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Two-Factor Authentication</CardTitle>
                <CardDescription>
                    Add an extra layer of security to your account.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Authenticator App Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Smartphone className="w-5 h-5 text-muted-foreground" />
                            <label htmlFor="otp-switch" className="font-medium text-sm">Authenticator App</label>
                        </div>
                        <Switch id="otp-switch" checked={isOtpEnabled} onCheckedChange={handleEnableOtp} />
                    </div>
                    {isOtpEnabled && (
                        <div className="pl-8 space-y-4 pt-2 border-l-2 border-muted/50 ml-2.5">
                            <p className="text-sm text-muted-foreground">
                                Scan the QR code with your authenticator app, then enter the 6-digit code below.
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
                                    placeholder="6-digit code" 
                                    value={otpCode}
                                    onChange={(e) => setOtpCode(e.target.value)}
                                    maxLength={6}
                                />
                                <Button onClick={handleVerifyOtp} disabled={isVerifying || otpCode.length < 6}>
                                    {isVerifying ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
                                    ) : (
                                        "Verify"
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
                            <h4 className="font-medium text-sm">Passkeys / Security Keys</h4>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleAddPasskey}>
                            Add Passkey
                        </Button>
                    </div>
                     <div className="pl-8 space-y-3">
                        {passkeys.length > 0 ? (
                            passkeys.map(key => (
                                <div key={key.id} className="flex items-center justify-between text-sm">
                                    <div className="flex flex-col">
                                        <span>{key.name}</span>
                                        <span className="text-xs text-muted-foreground">Added on {key.added}</span>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleRemovePasskey(key.id)}>
                                        <Trash2 className="h-4 w-4"/>
                                        <span className="sr-only">Remove passkey</span>
                                    </Button>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground">You have no passkeys registered.</p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
