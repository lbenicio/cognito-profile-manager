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
  const [currentDate, setCurrentDate] = useState<Date | null>(null);

  useEffect(() => {
    // This code runs only on the client, after the component has mounted.
    // It sets the date for the first time and then starts the timer.
    setCurrentDate(new Date());
    const timer = setInterval(() => setCurrentDate(new Date()), 1000);
    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <footer className="bg-card border-t">
      <div className="container mx-auto py-8 px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Left side: Logo, Copyright, and Clock */}
          <div className="md:col-span-2 flex flex-col gap-4 items-start">
             <Link href="/" className="flex items-center gap-2 text-xl font-bold">
                <LayoutDashboard className="h-6 w-6 text-primary" />
                <span>Outpost</span>
            </Link>
            <div className="text-sm text-muted-foreground" style={{ minHeight: '20px' }}>
              {currentDate && <p>{t('copyright', { year: currentDate.getFullYear() })}</p>}
            </div>
             <div className="text-sm text-muted-foreground space-y-1 pt-2">
                <div className="flex items-center gap-2" style={{ minHeight: '20px' }}>
                    <Calendar className="h-4 w-4" />
                    {currentDate && <span>{format(currentDate, 'PPP')}</span>}
                </div>
                 <div className="flex items-center gap-2" style={{ minHeight: '20px' }}>
                    <Clock className="h-4 w-4" />
                    {currentDate && <span>{format(currentDate, 'p')}</span>}
                </div>
            </div>
          </div>
          
          {/* Right side: Sitemap Columns */}
          <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold mb-4">{tSitemap('accountColumnTitle')}</h3>
              <nav className="flex flex-col gap-2">
                <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">{tSitemap('dashboard')}</Link>
                <Link href="/account" className="text-sm text-muted-foreground hover:text-primary transition-colors">{tSitemap('account')}</Link>
                <Link href="/profile" className="text-sm text-muted-foreground hover:text-primary transition-colors">{tSitemap('profile')}</Link>
                <Link href="/settings" className="text-sm text-muted-foreground hover:text-primary transition-colors">{tSitemap('settings')}</Link>
              </nav>
            </div>
            <div>
              <h3 className="font-semibold mb-4">{tSitemap('companyColumnTitle')}</h3>
              <nav className="flex flex-col gap-2">
                <Link href="/security" className="text-sm text-muted-foreground hover:text-primary transition-colors">{tSitemap('security')}</Link>
                <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">{tSitemap('contact')}</Link>
              </nav>
            </div>
            <div>
              <h3 className="font-semibold mb-4">{tLegal('title')}</h3>
              <nav className="flex flex-col gap-2">
                <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">{tLegal('terms')}</Link>
                <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">{tLegal('privacy')}</Link>
              </nav>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}
