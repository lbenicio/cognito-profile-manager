'use client';
import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { Link } from '@/navigation';
import { LayoutDashboard, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';

export function Footer() {
  const t = useTranslations('Footer');
  const tSitemap = useTranslations('Footer.sitemap');
  const tLegal = useTranslations('Footer.legal');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [isClient, setIsClient] = useState<boolean>(false);

  useEffect(() => {
    setIsClient(true);

    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <footer className='border-t bg-card'>
      <div className='container mx-auto px-4 py-8 md:px-8'>
        <div className='grid grid-cols-1 gap-8 md:grid-cols-4'>
          <div className='flex flex-col items-start gap-4 md:col-span-2'>
            <Link
              href='/'
              className='flex items-center gap-2 text-xl font-bold'
            >
              <LayoutDashboard className='h-6 w-6 text-primary' />
              <span>Outpost</span>
            </Link>
            <div
              className='text-sm text-muted-foreground'
              style={{ minHeight: '20px' }}
            >
              {isClient && (
                <p>{t('copyright', { year: currentDate.getFullYear() })}</p>
              )}
            </div>
            <div className='space-y-1 pt-2 text-sm text-muted-foreground'>
              <div
                className='flex items-center gap-2'
                style={{ minHeight: '20px' }}
              >
                <Calendar className='h-4 w-4' />
                {isClient && <span>{format(currentDate, 'PPP')}</span>}
              </div>
              <div
                className='flex items-center gap-2'
                style={{ minHeight: '20px' }}
              >
                <Clock className='h-4 w-4' />
                {isClient && <span>{format(currentDate, 'p')}</span>}
              </div>
            </div>
          </div>

          <div className='grid grid-cols-2 gap-8 md:col-span-2 md:grid-cols-3'>
            <div>
              <h3 className='mb-4 font-semibold'>
                {tSitemap('accountColumnTitle')}
              </h3>
              <nav className='flex flex-col gap-2'>
                <Link
                  href='/'
                  className='text-sm text-muted-foreground transition-colors hover:text-primary'
                >
                  {tSitemap('dashboard')}
                </Link>
                <Link
                  href='/account'
                  className='text-sm text-muted-foreground transition-colors hover:text-primary'
                >
                  {tSitemap('account')}
                </Link>
                <Link
                  href='/profile'
                  className='text-sm text-muted-foreground transition-colors hover:text-primary'
                >
                  {tSitemap('profile')}
                </Link>
              </nav>
            </div>
            <div>
              <h3 className='mb-4 font-semibold'>
                {tSitemap('companyColumnTitle')}
              </h3>
              <nav className='flex flex-col gap-2'>
                <Link
                  href='/settings'
                  className='text-sm text-muted-foreground transition-colors hover:text-primary'
                >
                  {tSitemap('settings')}
                </Link>
                <Link
                  href='/security'
                  className='text-sm text-muted-foreground transition-colors hover:text-primary'
                >
                  {tSitemap('security')}
                </Link>
                <Link
                  href='/contact'
                  className='text-sm text-muted-foreground transition-colors hover:text-primary'
                >
                  {tSitemap('contact')}
                </Link>
              </nav>
            </div>
            <div>
              <h3 className='mb-4 font-semibold'>{tLegal('title')}</h3>
              <nav className='flex flex-col gap-2'>
                <Link
                  href='/terms'
                  className='text-sm text-muted-foreground transition-colors hover:text-primary'
                >
                  {tLegal('terms')}
                </Link>
                <Link
                  href='/privacy'
                  className='text-sm text-muted-foreground transition-colors hover:text-primary'
                >
                  {tLegal('privacy')}
                </Link>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
