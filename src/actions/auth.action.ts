'use server';

import { redirect } from 'next/navigation';
import { createMockSession, getSession, deleteSession } from '@/lib/session';
import { mockAdminUser, mockUser } from '@/lib/mock-data';
import type { AuthTokenPayload } from '@/interfaces/auth/auth.interfaces';
import { getBaseUrl } from '@/lib/url';

export async function ssoLogin() {
  redirect('/api/v1/auth/sso/start');
}

export async function devAdminLogin() {
  if (process.env.NODE_ENV !== 'development') {
    throw new Error('This action is only available in development.');
  }

  const now = Math.floor(Date.now() / 1000);
  const expiresIn = 3600; // 1 hour

  const claims: AuthTokenPayload = {
    sub: mockAdminUser.sub,
    email: mockAdminUser.email,
    name: mockAdminUser.name,
    exp: now + expiresIn,
    iat: now,
    auth_time: now,
    'cognito:groups': mockAdminUser.groups,
    email_verified: true,
    token_use: 'id',
    client_id: 'mock_client_id_admin',
    aud: 'mock_client_id_admin',
    iss: 'https://cognito-idp.us-east-1.amazonaws.com/mock_pool',
    given_name: mockAdminUser.name.split(' ')[0],
    family_name: mockAdminUser.name.split(' ')[1],
    username: mockAdminUser.username,
  };

  await createMockSession({
    username: mockAdminUser.username,
    claims,
    accessToken: 'mock-access-token-admin',
    refreshToken: 'mock-refresh-token-admin',
  });

  return { success: true, redirectTo: '/' };
}

export async function devUserLogin() {
  if (process.env.NODE_ENV !== 'development') {
    throw new Error('This action is only available in development.');
  }

  const now = Math.floor(Date.now() / 1000);
  const expiresIn = 3600; // 1 hour

  const claims: AuthTokenPayload = {
    sub: mockUser.sub,
    email: mockUser.email,
    name: mockUser.name,
    exp: now + expiresIn,
    iat: now,
    auth_time: now,
    'cognito:groups': mockUser.groups,
    email_verified: true,
    token_use: 'id',
    client_id: 'mock_client_id_user',
    aud: 'mock_client_id_user',
    iss: 'https://cognito-idp.us-east-1.amazonaws.com/mock_pool',
    given_name: mockUser.name.split(' ')[0],
    family_name: mockUser.name.split(' ')[1],
    username: mockUser.username,
  };

  await createMockSession({
    username: mockUser.username,
    claims,
    accessToken: 'mock-access-token-user',
    refreshToken: 'mock-refresh-token-user',
  });

  return { success: true, redirectTo: '/' };
}

export async function localLogout() {
  const session = await getSession();

  // If the session is a mock session, handle logout directly.
  if (session?.isMock) {
    await deleteSession();
    redirect('/login');
  } else {
    // For real sessions, redirect to the API route that handles Cognito logout.
    redirect('/api/v1/auth/logout');
  }
}

export async function mockLogin(type: 'admin' | 'user') {
  const claims: AuthTokenPayload =
    type === 'admin'
      ? {
          sub: 'mock-admin-sub',
          email: 'admin@example.com',
          name: 'Mock Admin',
          'cognito:groups': ['admins'],
          email_verified: true,
          token_use: 'id',
          client_id: 'mock-client',
          aud: 'mock-client',
          iss: 'mock-issuer',
          exp: Math.floor(Date.now() / 1000) + 3600,
          iat: Math.floor(Date.now() / 1000),
          username: 'mockadmin',
        }
      : {
          sub: 'mock-user-sub',
          email: 'user@example.com',
          name: 'Mock User',
          'cognito:groups': ['users'],
          email_verified: true,
          token_use: 'id',
          client_id: 'mock-client',
          aud: 'mock-client',
          iss: 'mock-issuer',
          exp: Math.floor(Date.now() / 1000) + 3600,
          iat: Math.floor(Date.now() / 1000),
          username: 'mockuser',
        };

  await createMockSession({
    username: claims.username!,
    claims,
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
  });

  const baseUrl = await getBaseUrl();
  redirect(baseUrl);
}
