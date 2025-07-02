'use server';

import { redirect } from 'next/navigation';
import { createMockSession } from '@/lib/session';
import { mockAdminUser, mockUser } from '@/lib/mock-data';

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
      'cognito:groups': mockAdminUser.groups,
      email_verified: true,
      phone_number: mockAdminUser.phone_number,
      phone_number_verified: mockAdminUser.phone_number_verified,
      picture: mockAdminUser.picture,
      locale: mockAdminUser.locale,
      zoneinfo: mockAdminUser.zoneinfo,
      website: mockAdminUser.website,
      gender: mockAdminUser.gender,
      birthdate: mockAdminUser.birthdate,
      address: mockAdminUser.address,
    },
    accessToken: 'mock-access-token-admin',
    refreshToken: 'mock-refresh-token-admin',
  });

  // Return success indicator instead of redirect for client-side handling
  return { success: true, redirectTo: '/' };
}

export async function devUserLogin() {
  if (process.env.NODE_ENV !== 'development') {
    throw new Error('This action is only available in development.');
  }

  const now = Math.floor(Date.now() / 1000);
  const expiresIn = 3600; // 1 hour

  await createMockSession({
    username: mockUser.username,
    claims: {
      sub: mockUser.sub,
      email: mockUser.email,
      name: mockUser.name,
      exp: now + expiresIn,
      auth_time: now,
      'cognito:groups': mockUser.groups,
      email_verified: true,
      phone_number: mockUser.phone_number,
      phone_number_verified: mockUser.phone_number_verified,
      picture: mockUser.picture,
      locale: mockUser.locale,
      zoneinfo: mockUser.zoneinfo,
      website: mockUser.website,
      gender: mockUser.gender,
      birthdate: mockUser.birthdate,
      address: mockUser.address,
    },
    accessToken: 'mock-access-token-user',
    refreshToken: 'mock-refresh-token-user',
  });

  // Return success indicator instead of redirect for client-side handling
  return { success: true, redirectTo: '/' };
}

export async function localLogout() {
  // This action clears the local session and performs logout.
  // For real OAuth2 sessions: also calls Cognito logout endpoint.
  // For mock sessions: only clears local session.
  redirect('/api/v1/auth/logout');
}
