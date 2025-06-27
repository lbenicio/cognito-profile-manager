'use client';
import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { Link } from '@/navigation';
import { LayoutDashboard } from 'lucide-react';

export function Footer() {
  const t = useTranslations('Footer');
  const tSitemap = useTranslations('Footer.sitemap');
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    // This code runs only on the client, after the component has mounted,
    // ensuring the year is based on the client's clock and preventing a mismatch.
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="bg-card border-t">
      <div className="container mx-auto py-8 px-4 md:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          
          {/* Left side: Logo and Copyright */}
          <div className="flex flex-col gap-4 items-start">
             <Link href="/" className="flex items-center gap-2 text-xl font-bold">
                <LayoutDashboard className="h-6 w-6 text-primary" />
                <span>Outpost</span>
            </Link>
            <div className="text-sm text-muted-foreground" style={{minHeight: '21px'}}>
              {/* We only render the content once the year has been determined on the client */}
              {year !== null && <p>{t('copyright', { year })}</p>}
            </div>
          </div>
          
          {/* Right side: Sitemap */}
          <div className="grid grid-cols-1 gap-8">
            <div>
              <h3 className="font-semibold mb-4">{tSitemap('title')}</h3>
              <nav className="flex flex-col gap-2">
                <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">{tSitemap('dashboard')}</Link>
                <Link href="/account" className="text-sm text-muted-foreground hover:text-primary transition-colors">{tSitemap('account')}</Link>
                <Link href="/profile" className="text-sm text-muted-foreground hover:text-primary transition-colors">{tSitemap('profile')}</Link>
                <Link href="/settings" className="text-sm text-muted-foreground hover:text-primary transition-colors">{tSitemap('settings')}</Link>
              </nav>
            </div>
            {/* Future columns can be added here */}
          </div>

        </div>
      </div>
    </footer>
  );
}
