'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Smartphone, Loader2, Copy } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from 'next-intl';
import type { User } from '@/types/user/user.types';
import {
  generateMfaSetup,
  verifyAndEnableMfa,
  disableMfa,
} from '@/lib/mfa-actions';

interface TwoFactorAuthProps {
  user: User;
  onUpdateAction: (data: Partial<User>) => void;
}

export function TwoFactorAuth({ user, onUpdateAction }: TwoFactorAuthProps) {
  const { toast } = useToast();
  const t = useTranslations('Security.twoFactor');

  // MFA/TOTP State
  const [showSetup, setShowSetup] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isDisablingMfa, setIsDisablingMfa] = useState(false);

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
        description:
          error instanceof Error ? error.message : 'Failed to start MFA setup.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCancelSetup = () => {
    setShowSetup(false);
    setQrCode('');
    setOtpCode('');
    setSecret('');
  };

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
        onUpdateAction({ twoFactorEnabled: true });
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
        description:
          error instanceof Error ? error.message : 'An unknown error occurred.',
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
        onUpdateAction({ twoFactorEnabled: false });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to disable MFA.',
      });
    } finally {
      setIsDisablingMfa(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        <div className='space-y-2'>
          <div className='flex items-start gap-3'>
            <Smartphone className='mt-1 h-5 w-5 flex-shrink-0 text-muted-foreground' />
            <div className='w-full'>
              <h4 className='text-sm font-medium'>{t('authenticatorApp')}</h4>
              {user.twoFactorEnabled ? (
                <div className='space-y-2 pt-2'>
                  <p className='text-sm text-green-700 dark:text-green-400'>
                    {t('statusEnabled')}
                  </p>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={handleDisableOtp}
                    disabled={isDisablingMfa}
                  >
                    {isDisablingMfa && (
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    )}
                    {t('disableButton')}
                  </Button>
                </div>
              ) : (
                <div className='space-y-4 pt-2'>
                  {!showSetup ? (
                    <>
                      <p className='text-sm text-muted-foreground'>
                        {t('statusDisabled')}
                      </p>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={handleStartSetup}
                        disabled={isGenerating}
                      >
                        {isGenerating && (
                          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        )}
                        {t('enableButton')}
                      </Button>
                    </>
                  ) : (
                    <div className='space-y-4'>
                      <p className='text-sm text-muted-foreground'>
                        {t('qrInstructions')}
                      </p>
                      <div className='flex w-fit justify-start rounded-md bg-white p-4'>
                        {qrCode ? (
                          <Image
                            src={qrCode}
                            alt='QR Code'
                            width={200}
                            height={200}
                            data-ai-hint='QR code'
                          />
                        ) : (
                          <div className='flex h-[200px] w-[200px] items-center justify-center'>
                            <Loader2 className='h-10 w-10 animate-spin' />
                          </div>
                        )}
                      </div>

                      <div className='space-y-2'>
                        <p className='text-sm text-muted-foreground'>
                          {t('manualEntryInstructions')}
                        </p>
                        <div className='flex max-w-xs items-center gap-2'>
                          <Input
                            readOnly
                            value={secret}
                            className='bg-muted/50 font-mono text-sm'
                            aria-label={t('copyKeyLabel')}
                          />
                          <Button
                            type='button'
                            variant='outline'
                            size='icon'
                            onClick={handleCopySecret}
                            aria-label={t('copyKeyLabel')}
                          >
                            <Copy className='h-4 w-4' />
                          </Button>
                        </div>
                      </div>

                      <Separator />

                      <div className='space-y-2'>
                        <p className='text-sm font-medium'>
                          {t('verifyTitle')}
                        </p>
                        <div className='flex max-w-xs gap-2'>
                          <Input
                            placeholder={t('codeInputPlaceholder')}
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value)}
                            maxLength={6}
                          />
                          <Button
                            onClick={handleVerifyOtp}
                            disabled={isVerifying || otpCode.length < 6}
                          >
                            {isVerifying && (
                              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            )}
                            {t('verify')}
                          </Button>
                        </div>
                      </div>

                      <Button
                        variant='link'
                        className='h-auto p-0'
                        onClick={handleCancelSetup}
                      >
                        {t('cancelButton')}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        <Separator />
        <div className='space-y-4'>
          <div className='flex items-start gap-3'>
            <Smartphone className='mt-1 h-5 w-5 flex-shrink-0 text-muted-foreground' />
            <div className='w-full space-y-4'>
              <h4 className='text-sm font-medium'>{t('smsMessagingTitle')}</h4>
              <p className='text-sm text-muted-foreground'>
                {t('smsMessagingDescription')}
              </p>
              <Button variant='outline' size='sm' disabled>
                {t('smsMessagingDisabled')}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
