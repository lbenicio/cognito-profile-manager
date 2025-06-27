import 'server-only';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { jwtVerify, createRemoteJWKSet } from 'jose';
import { cognitoClient, GetUserCommand } from '@/lib/cognito';
import { refreshAuthTokens } from './session-actions';

// Define the User type, which should match what the components expect.
export type UserPreferences = {
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'es';
  fontSize: number;
};

export type NotificationPreferences = {
  email: boolean;
  app: boolean;
  telegram: boolean;
  user: boolean;
  system: boolean;
  marketing: boolean;
};

export type PublicProfilePreferences = {
  isPublic: boolean;
  publicFields: {
    picture: boolean;
    banner: boolean;
    name: boolean;
    groups: boolean;
    email: boolean;
    website: boolean;
    aboutMe: boolean;
    phone_number: boolean;
    gender: boolean;
    zoneinfo: boolean;
    locale: boolean;
  };
};

export type Fingerprint = {
  date: string; // ISO string
  ip: string;
  device: string;
};

export type PasskeyInfo = {
  name: string;
  date: string; // ISO string
  ip: string;
  userAgent: string;
};

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
  picture: string;
  banner: string;
  locale: string;
  zoneinfo: string;
  website: string;
  gender: string;
  aboutMe: string;
  preferences: UserPreferences;
  notificationPreferences: NotificationPreferences;
  publicProfilePreferences: PublicProfilePreferences;
  fingerprint: Fingerprint[];
  passkeys: PasskeyInfo[];
};

const defaultPreferences: UserPreferences = {
  theme: 'system',
  language: 'en',
  fontSize: 12,
};

const defaultNotificationPreferences: NotificationPreferences = {
    email: true,
    app: true,
    telegram: false,
    user: true,
    system: true,
    marketing: false,
};

const defaultPublicProfilePreferences: PublicProfilePreferences = {
  isPublic: false,
  publicFields: {
    picture: true,
    banner: true,
    name: true,
    groups: true,
    email: false,
    website: false,
    aboutMe: true,
    phone_number: false,
    gender: false,
    zoneinfo: false,
    locale: false,
  },
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
  twoFactorEnabled: false,
  passkeysEnabled: true,
  groups: ['users', 'beta-testers'],
  isAdmin: false,
  picture: `https://placehold.co/128x128.png`,
  banner: `https://placehold.co/1500x500.png`,
  locale: 'en-US',
  zoneinfo: 'America/New_York',
  website: 'https://example.com',
  gender: 'Prefer not to say',
  aboutMe: 'This is a mock user bio for the development environment. I enjoy coding and building cool things with Next.js.',
  preferences: defaultPreferences,
  notificationPreferences: defaultNotificationPreferences,
  publicProfilePreferences: defaultPublicProfilePreferences,
  fingerprint: [
    { date: new Date().toISOString(), ip: '127.0.0.1', device: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36' },
    { date: new Date(Date.now() - 86400000).toISOString(), ip: '192.168.1.1', device: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1' },
  ],
  passkeys: [
    {
        name: 'Chrome on macOS',
        date: new Date(Date.now() - 86400000 * 2).toISOString(),
        ip: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    }
  ],
};

const mockAdminUser: User = {
  ...mockUser,
  username: 'adminuser_dev',
  name: 'Admin User',
  groups: ['users', process.env.COGNITO_ADMIN_GROUP_NAME || 'admins'],
  isAdmin: true,
  twoFactorEnabled: true,
  passkeysEnabled: true,
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
  let session = await getSession();

  // Handle mock development session (which doesn't have an id_token)
  if (process.env.NODE_ENV === 'development' && session?.username && !session?.id_token) {
    console.log("Using mock user data for development.");
    const baseUser = session.username === 'admin' ? mockAdminUser : mockUser;
    return { ...baseUser, email: session.email, username: session.username };
  }

  // If there's no session or no id_token, there's no real user.
  if (!session?.id_token) {
    return null;
  }
  
  const wellknownUrl = process.env.NEXT_PUBLIC_COGNITO_WELLKNOWN;
  if (!wellknownUrl) {
      console.error('Missing NEXT_PUBLIC_COGNITO_WELLKNOWN env var');
      return null;
  }

  try {
    const wellknownResponse = await fetch(wellknownUrl, { cache: 'no-store' });
    if (!wellknownResponse.ok) throw new Error('Failed to fetch OpenID configuration');
    const wellknown = await wellknownResponse.json();
    const JWKS = createRemoteJWKSet(new URL(wellknown.jwks_uri));

    try {
        await jwtVerify(session.id_token, JWKS, {
            issuer: wellknown.issuer,
            audience: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
        });
    } catch (error: any) {
        if (error.code === 'ERR_JWT_EXPIRED' && session.refresh_token) {
            console.log('Access token expired. Attempting refresh...');
            const newSession = await refreshAuthTokens(session.refresh_token);
            if (newSession) {
                console.log('Token refresh successful.');
                session = newSession; // Continue with the new session
            } else {
                console.error('Token refresh failed. Clearing session.');
                cookies().set('auth_session', '', { expires: new Date(0), path: '/' });
                return null;
            }
        } else {
            console.error('JWT validation error:', error.message);
            cookies().set('auth_session', '', { expires: new Date(0), path: '/' });
            return null;
        }
    }
    
    // If we've reached here, the session is valid (either originally or after a refresh).
    // Now, fetch the most up-to-date user attributes from Cognito.
    const { payload } = await jwtVerify(session.id_token, JWKS);
    const getUserCommand = new GetUserCommand({ AccessToken: session.access_token });
    const cognitoUser = await cognitoClient.send(getUserCommand);
    const attributes = cognitoUser.UserAttributes?.reduce((acc, attr) => {
        if (attr.Name && attr.Value) {
            acc[attr.Name] = attr.Value;
        }
        return acc;
    }, {} as Record<string, string>) || {};

    const adminGroupName = process.env.COGNITO_ADMIN_GROUP_NAME || 'admins';
    const groupsClaimKey = process.env.COGNITO_GROUPS_CLAIM_KEY || 'cognito:groups';
    const groups = (payload[groupsClaimKey] as string[]) || [];
    const isAdmin = groups.includes(adminGroupName);
    
    const freshGivenName = attributes.given_name || '';
    const freshFamilyName = attributes.family_name || '';

    let preferences: UserPreferences = { ...defaultPreferences };
    if (attributes['custom:session']) {
        try {
            preferences = { ...defaultPreferences, ...JSON.parse(attributes['custom:session']) };
        } catch (e) {
            console.error('Failed to parse user preferences from GetUser API call', e);
        }
    }
    
    let publicProfilePreferences: PublicProfilePreferences = { ...defaultPublicProfilePreferences };
    const publicProfileClaim = attributes['custom:public-profile'];
    if (publicProfileClaim) {
        try {
            const parsedPrefs = JSON.parse(publicProfileClaim);
            publicProfilePreferences = {
                isPublic: parsedPrefs.isPublic ?? defaultPublicProfilePreferences.isPublic,
                publicFields: {
                    ...defaultPublicProfilePreferences.publicFields,
                    ...(parsedPrefs.publicFields || {}),
                }
            };
        } catch (e) {
            console.error('Failed to parse public profile preferences from GetUser API call', e);
        }
    }

    const notificationPreferences: NotificationPreferences = {
        email: attributes['custom:email-notification'] === 'true',
        app: attributes['custom:app-notification'] === 'true',
        telegram: attributes['custom:tlgm-notification'] === 'true',
        user: attributes['custom:user-notifications'] === 'true',
        system: attributes['custom:system-notifications'] === 'true',
        marketing: attributes['custom:mkt-notifications'] === 'true',
    };

    let fingerprintData: Fingerprint[] = [];
    if (attributes['custom:fingerprint']) {
        try {
            fingerprintData = JSON.parse(attributes['custom:fingerprint']);
        } catch (e) {
            console.error('Failed to parse user fingerprint from GetUser API call', e);
        }
    }
    
    let passkeysData: PasskeyInfo[] = [];
    if (attributes['custom:passkeys']) {
        try {
            passkeysData = JSON.parse(attributes['custom:passkeys']);
        } catch (e) {
            console.error('Failed to parse user passkeys from GetUser API call', e);
        }
    }

    return {
      username: cognitoUser.Username || (payload['cognito:username'] as string) || '',
      email: attributes.email || (payload.email as string) || '',
      email_verified: attributes.email_verified === 'true',
      name: [freshGivenName, freshFamilyName].filter(Boolean).join(' ') || (payload.name as string) || '',
      address: attributes.address || '',
      phone_number: attributes.phone_number || (payload.phone_number as string) || '',
      phone_number_verified: attributes.phone_number_verified === 'true',
      creationDate: new Date((payload.auth_time as number) * 1000).toISOString(),
      userStatus: cognitoUser.UserStatus || 'CONFIRMED',
      twoFactorEnabled: attributes['custom:mfa'] === 'true',
      passkeysEnabled: attributes['custom:pless'] === 'true',
      groups: groups,
      isAdmin: isAdmin,
      picture: attributes.picture || (payload.picture as string) || '',
      banner: attributes['custom:banner'] || '',
      locale: attributes.locale || (payload.locale as string) || '',
      zoneinfo: attributes.zoneinfo || (payload.zoneinfo as string) || '',
      website: attributes.website || (payload.website as string) || '',
      gender: attributes.gender || (payload.gender as string) || '',
      aboutMe: attributes['custom:aboutme'] || '',
      preferences: preferences,
      notificationPreferences: notificationPreferences,
      publicProfilePreferences: publicProfilePreferences,
      fingerprint: fingerprintData,
      passkeys: passkeysData,
    };

  } catch (error: any) {
    console.error("General error in getUser:", error);
    // Clearing the cookie here is a safe fallback
    cookies().set('auth_session', '', { expires: new Date(0), path: '/' });
    return null;
  }
});
