'use server';

import { redirect } from 'next/navigation';
import { createMockSession } from '@/lib/session';
import { mockAdminUser } from '@/lib/mock-data';
import type { SessionCacheData } from '@/interfaces/lib/session.interfaces';

export async function ssoLogin(): Promise<void> {
  redirect('/api/v1/auth/sso/start');
}

export async function devAdminLogin(): Promise<void> {
  if (process.env.NODE_ENV !== 'development') {
    throw new Error('This action is only available in development.');
  }

  const now = Math.floor(Date.now() / 1000);
  const expiresIn = 3600; // 1 hour

  const sessionData: SessionCacheData = {
    username: mockAdminUser.username,
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    claims: {
      sub: mockAdminUser.sub,
      email: mockAdminUser.email,
      name: mockAdminUser.name,
      exp: now + expiresIn,
      auth_time: now,
    },
  };

  await createMockSession(sessionData);
  redirect('/');
}

export async function localLogout(): Promise<void> {
  await deleteSession();
  redirect('/login');
}
