'use server';

import { cookies } from 'next/headers';
import { locales } from '@/navigation';

export async function setLocale(locale: string) {
  // Validate that the incoming `locale` parameter is a valid locale
  if (locales.includes(locale as any)) {
    cookies().set('NEXT_LOCALE', locale);
  }
}
