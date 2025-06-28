
'use server';

import { cookies, headers } from 'next/headers';
import { redirect } from '@/navigation';

// Dev-only action for the "Sign In as Admin" button
export async function devAdminLogin() {
  if (process.env.NODE_ENV !== 'development') {
    return 'This action is only available in development.';
  }
  const sessionData = { username: 'admin', email: 'sso-admin-dev@example.com' };

  // Determine if the connection is secure by checking the protocol header
  const protocol = headers().get('x-forwarded-proto') || 'http';
  const isSecure = protocol === 'https';
  
  (await cookies()).set('auth_session', JSON.stringify(sessionData), {
    httpOnly: true,
    secure: isSecure,
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/',
    sameSite: isSecure ? 'none' : 'lax',
  });
  redirect('/');
}
