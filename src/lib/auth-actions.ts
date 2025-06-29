'use server';

import { redirect } from 'next/navigation';
import { createMockSession, deleteSession } from '@/lib/session';
import { mockAdminUser } from '@/lib/mock-data';
import type { AuthActionResponse } from '@/types/api/response.types';

export async function ssoLogin() {
  redirect('/api/v1/auth/sso/start');
}

export async function devAdminLogin() {
  if (process.env.NODE_ENV !== 'development') {
    throw new Error('This action is only available in development.');
  }

  const now = Math.floor(Date.now() / 1000);
  const expiresIn = 3600; // 1 hour

  await createMockSession({
    username: mockAdminUser.username,
    claims: {
      sub: mockAdminUser.sub,
      email: mockAdminUser.email,
      name: mockAdminUser.name,
      exp: now + expiresIn,
      auth_time: now,
    },
    accessToken: 'mock-access-token', // Required for a valid mock session
    refreshToken: 'mock-refresh-token',
  });

  redirect('/');
}

export async function localLogout() {
  await deleteSession();
  redirect('/login');
}
