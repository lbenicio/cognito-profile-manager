'use server';

import { redirect } from 'next/navigation';
import { createMockSession, deleteSession } from '@/lib/session';
import { mockAdminUser } from '@/lib/auth';

export async function ssoLogin() {
  redirect('/api/v1/auth/sso/start');
}

export async function devAdminLogin() {
  if (process.env.NODE_ENV !== 'development') {
    return 'This action is only available in development.';
  }

  const now = Math.floor(Date.now() / 1000);
  const expiresIn = 3600; // 1 hour

  const sessionData = {
    username: mockAdminUser.username,
    claims: {
      sub: mockAdminUser.sub,
      email: mockAdminUser.email,
      name: mockAdminUser.name,
      // Mock claims need expiry for middleware to work
      exp: now + expiresIn,
      auth_time: now,
    },
    // Mock refresh token for consistency if middleware needs it
    refreshToken: 'mock-refresh-token',
  };

  await createMockSession(sessionData);
  redirect('/');
}

export async function localLogout() {
  await deleteSession();
  redirect('/login');
}
