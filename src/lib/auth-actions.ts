
'use server';

import { cookies, headers } from 'next/headers';
import { redirect } from '@/navigation';

// Dev-only action for the "Sign In as Admin" button
export async function devAdminLogin() {
  if (process.env.NODE_ENV !== 'development') {
    return 'This action is only available in development.';
  }
  const sessionData = { username: 'admin', email: 'sso-admin-dev@example.com' };
  
  const host = headers().get('host')!;
  const hostname = new URL(`http://${host}`).hostname;
  const domain = hostname === 'localhost' ? undefined : hostname;

  cookies().set('auth_session', JSON.stringify(sessionData), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
    domain,
  });
  redirect('/');
}
