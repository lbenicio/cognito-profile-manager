'use client';
import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { Link } from '@/navigation';

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
      <div className="container mx-auto py-6 px-4 md:px-8">
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-4">
          <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">{tSitemap('dashboard')}</Link>
          <Link href="/account" className="text-sm text-muted-foreground hover:text-primary transition-colors">{tSitemap('account')}</Link>
          <Link href="/profile" className="text-sm text-muted-foreground hover:text-primary transition-colors">{tSitemap('profile')}</Link>
          <Link href="/settings" className="text-sm text-muted-foreground hover:text-primary transition-colors">{tSitemap('settings')}</Link>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-center text-sm text-muted-foreground" style={{minHeight: '21px'}}>
          {/* We only render the content once the year has been determined on the client */}
          {year !== null && <p>{t('copyright', { year })}</p>}
        </div>
      </div>
    </footer>
  );
}
