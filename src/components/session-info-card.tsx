'use client';

import type { SessionInfoCardProps } from '@/types/components.types';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Clock, Computer, Globe, Timer } from 'lucide-react';
import { format, formatDistanceToNowStrict } from 'date-fns';
import type { User } from '@/types/user/user.types';
import { UAParser } from 'ua-parser-js';
import { Logger } from '@/lib/logger';

const logger = new Logger('SESSION-INFO-CARD');

const formatUserAgent = (uaString: string): string => {
  if (!uaString || uaString === 'Unknown') {
    return 'Unknown';
  }

  try {
    const parser = new UAParser(uaString);
    const browser = parser.getBrowser();
    const os = parser.getOS();
    const device = parser.getDevice();

    const parts: string[] = [];

    if (browser.name) {
      parts.push(browser.name);
    }

    if (
      device.model &&
      device.type &&
      [
        'mobile',
        'tablet',
        'console',
        'smarttv',
        'wearable',
        'xr',
        'embedded',
      ].includes(device.type)
    ) {
      parts.push(`on ${device.model}`);
    } else if (os.name) {
      parts.push(`on ${os.name}`);
    }

    const friendlyString = parts.join(' ');
    return friendlyString || uaString;
  } catch (e) {
    logger.error('Could not parse user agent:', e);
    return uaString;
  }
};

export function SessionInfoCard({ user }: SessionInfoCardProps) {
  const t = useTranslations('Dashboard.sessionInfo');
  const [timeLeft, setTimeLeft] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    const calculateTimeLeft = () => {
      const expiresAt = new Date(user.sessionExpiresAt * 1000);
      const now = new Date();
      if (expiresAt < now) {
        setTimeLeft(t('expired'));
        return;
      }
      setTimeLeft(formatDistanceToNowStrict(expiresAt, { addSuffix: false }));
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [user.sessionExpiresAt, t]);

  const sessionStartedDate = new Date(user.sessionStartedAt * 1000);
  const currentDevice = user.fingerprint?.[0];

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Timer className='text-primary' />
          {t('title')}
        </CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent className='space-y-4 text-sm'>
        <div className='flex items-center justify-between'>
          <div className='text-muted-foreground flex items-center gap-2'>
            <Clock className='h-4 w-4' />
            <span>{t('startedAt')}</span>
          </div>
          <span className='font-medium'>
            {isMounted ? format(sessionStartedDate, 'PPP p') : '...'}
          </span>
        </div>
        <div className='flex items-center justify-between'>
          <div className='text-muted-foreground flex items-center gap-2'>
            <Timer className='h-4 w-4' />
            <span>{t('expiresIn')}</span>
          </div>
          <span className='font-medium'>{isMounted ? timeLeft : '...'}</span>
        </div>
        <div className='flex items-center justify-between'>
          <div className='text-muted-foreground flex items-center gap-2'>
            <Computer className='h-4 w-4' />
            <span>{t('currentDevice')}</span>
          </div>
          <span className='max-w-[150px] truncate font-medium'>
            {isMounted && currentDevice
              ? formatUserAgent(currentDevice.device)
              : '...'}
          </span>
        </div>
        <div className='flex items-center justify-between'>
          <div className='text-muted-foreground flex items-center gap-2'>
            <Globe className='h-4 w-4' />
            <span>{t('ipAddress')}</span>
          </div>
          <span className='font-medium'>{currentDevice?.ip || '...'}</span>
        </div>
      </CardContent>
    </Card>
  );
}
