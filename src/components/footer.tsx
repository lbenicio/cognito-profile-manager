'use client';
import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { LayoutDashboard, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';

export function Footer() {
  const t = useTranslations('Footer');
  const tSitemap = useTranslations('Footer.sitemap');
  const tLegal = useTranslations('Footer.legal');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // This effect runs only on the client, after the component has mounted.
    // It signals that it's safe to render client-specific content.
    setIsClient(true);

    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <footer className='bg-card border-t'>
      <div className='container mx-auto px-4 py-8 md:px-8'>
        <div className='grid grid-cols-1 gap-8 md:grid-cols-4'>
          {/* Left side: Logo, Copyright, and Clock */}
          <div className='flex flex-col items-start gap-4 md:col-span-2'>
            <Link
              href='/'
              className='flex items-center gap-2 text-xl font-bold'
            >
              <LayoutDashboard className='text-primary h-6 w-6' />
              <span>Outpost</span>
            </Link>
            <div
              className='text-muted-foreground text-sm'
              style={{ minHeight: '20px' }}
            >
              {isClient && (
                <p>{t('copyright', { year: currentDate.getFullYear() })}</p>
              )}
            </div>
            <div className='text-muted-foreground space-y-1 pt-2 text-sm'>
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

          {/* Right side: Sitemap Columns */}
          <div className='grid grid-cols-2 gap-8 md:col-span-2 md:grid-cols-3'>
            <div>
              <h3 className='mb-4 font-semibold'>
                {tSitemap('accountColumnTitle')}
              </h3>
              <nav className='flex flex-col gap-2'>
                <Link
                  href='/'
                  className='text-muted-foreground hover:text-primary text-sm transition-colors'
                >
                  {tSitemap('dashboard')}
                </Link>
                <Link
                  href='/account'
                  className='text-muted-foreground hover:text-primary text-sm transition-colors'
                >
                  {tSitemap('account')}
                </Link>
                <Link
                  href='/profile'
                  className='text-muted-foreground hover:text-primary text-sm transition-colors'
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
                  className='text-muted-foreground hover:text-primary text-sm transition-colors'
                >
                  {tSitemap('settings')}
                </Link>
                <Link
                  href='/security'
                  className='text-muted-foreground hover:text-primary text-sm transition-colors'
                >
                  {tSitemap('security')}
                </Link>
                <Link
                  href='/contact'
                  className='text-muted-foreground hover:text-primary text-sm transition-colors'
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
                  className='text-muted-foreground hover:text-primary text-sm transition-colors'
                >
                  {tLegal('terms')}
                </Link>
                <Link
                  href='/privacy'
                  className='text-muted-foreground hover:text-primary text-sm transition-colors'
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
