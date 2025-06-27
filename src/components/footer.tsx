'use client';
import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';

export function Footer() {
  const t = useTranslations('Footer');
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    // This code runs only on the client, after the component has mounted,
    // ensuring the year is based on the client's clock and preventing a mismatch.
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="bg-card border-t">
      <div className="container mx-auto py-6 px-4 md:px-8 flex flex-col md:flex-row items-center justify-center text-sm text-muted-foreground" style={{minHeight: '21px'}}>
        {/* We only render the content once the year has been determined on the client */}
        {year !== null && <p>{t('copyright', { year })}</p>}
      </div>
    </footer>
  );
}
