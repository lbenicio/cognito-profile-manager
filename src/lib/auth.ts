import 'server-only';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { jwtVerify, createRemoteJWKSet } from 'jose';

// Define the User type, which should match what the components expect.
export type User = {
  username: string;
  email: string;
  email_verified: boolean;
  name: string;
  address: string;
  phone_number: string;
  phone_number_verified: boolean;
  creationDate: string; // ISO string
  userStatus: string;
  twoFactorEnabled: boolean;
  passkeysEnabled: boolean;
  groups: string[];
  isAdmin: boolean;
};

// Mock user data for development environment
const mockUser: User = {
  username: 'testuser_dev',
  email: 'dev@example.com',
  email_verified: true,
  name: 'Dev User',
  address: '123 Dev Lane, Developer City, DS',
  phone_number: '+10000000000',
  phone_number_verified: true,
  creationDate: new Date().toISOString(),
  userStatus: 'CONFIRMED',
  twoFactorEnabled: true,
  passkeysEnabled: true,
  groups: ['users', 'beta-testers'],
  isAdmin: false,
};

const mockAdminUser: User = {
  ...mockUser,
  username: 'adminuser_dev',
  name: 'Admin User',
  groups: ['users', process.env.COGNITO_ADMIN_GROUP_NAME || 'admins'],
  isAdmin: true,
};


// This function safely parses the session cookie.
export const getSession = cache(async () => {
    const sessionCookie = cookies().get('auth_session')?.value;
    if (!sessionCookie) return null;
    try {
        return JSON.parse(sessionCookie);
    } catch {
        // If the cookie is malformed, treat it as no session.
        return null;
    }
});

// This function is cached per request and retrieves the authenticated user's data.
export const getUser = cache(async (): Promise<User | null> => {
  const session = await getSession();

  // Handle mock development session (which doesn't have an id_token)
  if (process.env.NODE_ENV === 'development' && session?.username && !session?.id_token) {
    console.log("Using mock user data for development.");
    if (session.username === 'admin') {
      return { ...mockAdminUser, email: session.email, username: session.username };
    }
    return { ...mockUser, email: session.email, username: session.username };
  }

  // If there's no session or no id_token, there's no real user.
  if (!session?.id_token) {
    return null;
  }

  try {
    // In production, verify the JWT and extract claims.
    const wellknownUrl = process.env.NEXT_PUBLIC_COGNITO_WELLKNOWN;
    if (!wellknownUrl) throw new Error('Missing NEXT_PUBLIC_COGNITO_WELLKNOWN env var');
    
    const wellknownResponse = await fetch(wellknownUrl, { cache: 'force-cache' });
    if (!wellknownResponse.ok) throw new Error('Failed to fetch OpenID configuration');
    const wellknown = await wellknownResponse.json();

    const jwksUri = wellknown.jwks_uri;
    const JWKS = createRemoteJWKSet(new URL(jwksUri));

    const { payload } = await jwtVerify(session.id_token, JWKS, {
      issuer: wellknown.issuer,
      audience: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
    });

    const adminGroupName = process.env.COGNITO_ADMIN_GROUP_NAME || 'admins';
    const groups = (payload['cognito:groups'] as string[]) || [];
    const isAdmin = groups.includes(adminGroupName);
    
    // OIDC address claim is an object, we get the formatted version.
    const addressClaim = payload.address as { formatted?: string } | undefined;

    const user: User = {
      username: (payload['cognito:username'] as string) || '',
      email: (payload.email as string) || '',
      email_verified: (payload.email_verified as boolean) || false,
      name: (payload.name as string) || '',
      address: addressClaim?.formatted ?? '',
      phone_number: (payload.phone_number as string) || '',
      phone_number_verified: (payload.phone_number_verified as boolean) || false,
      // auth_time is in seconds, convert to ISO string
      creationDate: new Date((payload.auth_time as number) * 1000).toISOString(),
      userStatus: 'CONFIRMED', // OIDC tokens don't have a user status, assume CONFIRMED
      twoFactorEnabled: Array.isArray(payload.amr) && payload.amr.includes('mfa'),
      passkeysEnabled: false, // This info isn't in standard OIDC tokens.
      groups: groups,
      isAdmin: isAdmin,
    };

    return user;

  } catch (error) {
    console.error("JWT Verification failed or user data processing error:", error);
    // If the token is invalid for any reason, clear the session cookie.
    cookies().set('auth_session', '', { expires: new Date(0) });
    return null;
  }
});
