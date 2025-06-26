'use client';
import { useTranslations } from 'next-intl';

export function Footer() {
  const t = useTranslations('Footer');
  const year = new Date().getFullYear();

  return (
    <footer className="bg-card border-t">
      <div className="container mx-auto py-6 px-4 md:px-8 flex flex-col md:flex-row items-center justify-center text-sm text-muted-foreground">
        <p>{t('copyright', {year})}</p>
      </div>
    </footer>
  );
}
