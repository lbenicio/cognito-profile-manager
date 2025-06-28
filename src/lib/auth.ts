
import 'server-only';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { jwtVerify, createRemoteJWKSet, type JWTPayload } from 'jose';
import { cognitoClient, GetUserCommand, ListWebAuthnCredentialsCommand } from '@/lib/cognito';


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
    birthdate: boolean;
    zoneinfo: boolean;
    locale: boolean;
  };
};

export type Fingerprint = {
  date: string; // ISO string
  ip: string;
  device: string;
};

export type Device = {
  key: string;
  name: string;
  createDate?: string;
  lastAuthDate?: string;
};

export type User = {
  sub: string;
  username: string;
  email: string;
  email_verified: boolean;
  name: string;
  address: string;
  phone_number: string;
  phone_number_verified: boolean;
  birthdate: string;
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
  devices: Device[];
  sessionStartedAt: number; // Unix timestamp (seconds)
  sessionExpiresAt: number; // Unix timestamp (seconds)
};

export type Session = ({
  claims: JWTPayload;
  accessToken: string;
  refreshToken: string;
} | {
  // For dev mode
  username: string;
  claims?: never;
  accessToken?: never;
  refreshToken?: never;
}) & {
  // Common properties for both session types
} | null;


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
    birthdate: false,
    zoneinfo: false,
    locale: false,
  },
};

const nowInSeconds = Math.floor(Date.now() / 1000);

// Mock user data for development environment
const mockUser: User = {
  sub: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  username: 'testuser_dev',
  email: 'dev@example.com',
  email_verified: true,
  name: 'Dev User',
  address: '123 Dev Lane, Developer City, DS',
  phone_number: '+10000000000',
  phone_number_verified: true,
  birthdate: '1990-01-15',
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
  devices: [
    {
        key: 'mock_device_1',
        name: 'Passkey on macOS',
        createDate: new Date(Date.now() - 86400000 * 2).toISOString(),
        lastAuthDate: new Date(Date.now() - 86400000 * 2).toISOString(),
    }
  ],
  sessionStartedAt: nowInSeconds,
  sessionExpiresAt: nowInSeconds + 3600, // Expires in 1 hour
};

const mockAdminUser: User = {
  ...mockUser,
  username: 'adminuser_dev',
  name: 'Admin User',
  groups: ['users', process.env.COGNITO_ADMIN_GROUP_NAME || 'admins'],
  isAdmin: true,
  twoFactorEnabled: true,
  passkeysEnabled: true,
  devices: mockUser.devices,
};


export const getSession = cache(async (): Promise<Session> => {
  const sessionCookie = (await cookies()).get('auth_session')?.value;
  if (!sessionCookie) return null;
  try {
    const session = JSON.parse(sessionCookie);

    // Middleware handles validation and refresh, so here we just trust the parsed cookie.
    // If it has 'claims', it's a real session. If it has 'username', it's a dev session.
    if (session.claims || session.username) {
        return session;
    }
    return null;

  } catch {
    return null;
  }
});

// This function is cached per request and retrieves the authenticated user's data.
export const getUser = cache(async (): Promise<User | null> => {
  const session = await getSession();

  // Handle mock development session
  if (session?.username) {
    console.log('Using mock user data for development.');
    const baseUser = session.username === 'admin' ? mockAdminUser : mockUser;
    return {
      ...baseUser,
      username: session.username,
    };
  }

  // If there's no session or it's not a valid session structure, return null.
  if (!session?.claims || !session.accessToken) {
    return null;
  }

  try {
    // Fetch the most up-to-date user attributes from Cognito using the access token.
    const getUserCommand = new GetUserCommand({
      AccessToken: session.accessToken,
    });
    const cognitoUser = await cognitoClient.send(getUserCommand);

    const attributes =
      cognitoUser.UserAttributes?.reduce(
        (acc, attr) => {
          if (attr.Name && attr.Value) {
            acc[attr.Name] = attr.Value;
          }
          return acc;
        },
        {} as Record<string, string>
      ) || {};
    
    // Use claims from the session for data that doesn't change or is authoritative from the token.
    const { claims } = session;
    const adminGroupName = process.env.COGNITO_ADMIN_GROUP_NAME || 'admins';
    const groupsClaimKey = process.env.COGNITO_GROUPS_CLAIM_KEY || 'cognito:groups';
    const groups = (claims[groupsClaimKey] as string[]) || [];
    const isAdmin = groups.includes(adminGroupName);

    const freshGivenName = attributes.given_name || '';
    const freshFamilyName = attributes.family_name || '';

    let preferences: UserPreferences = { ...defaultPreferences };
    if (attributes['custom:session']) {
      try {
        preferences = {
          ...defaultPreferences,
          ...JSON.parse(attributes['custom:session']),
        };
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
          },
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

    // Fetch user's registered WebAuthn credentials (passkeys).
    let devices: Device[] = [];
    try {
      const listCredentialsCommand = new ListWebAuthnCredentialsCommand({
        AccessToken: session.accessToken,
      });
      const credentialsResponse = await cognitoClient.send(listCredentialsCommand);

      devices = (credentialsResponse.Credentials || [])
        .map((credential) => {
          if (!credential.CredentialId) return null;

          const name = `Passkey on ${credential.UserAgent ? credential.UserAgent.split(') ')[0].split(' (').pop() : 'Unknown Device'}`;
          
          return {
            key: credential.CredentialId,
            name: name,
            createDate: credential.CreateDate?.toISOString(),
            lastAuthDate: credential.LastUsedDate?.toISOString(),
          };
        })
        .filter((d): d is Device => d !== null);

    } catch (e: any) {
      console.error('Could not fetch WebAuthn credentials for user:', e);
    }

    return {
      sub: claims.sub as string,
      username: cognitoUser.Username || (claims['cognito:username'] as string) || '',
      email: attributes.email || (claims.email as string) || '',
      email_verified: attributes.email_verified === 'true',
      name: [freshGivenName, freshFamilyName].filter(Boolean).join(' ') || (claims.name as string) || '',
      address: attributes.address || '',
      phone_number: attributes.phone_number || (claims.phone_number as string) || '',
      phone_number_verified: attributes.phone_number_verified === 'true',
      birthdate: attributes.birthdate || '',
      creationDate: new Date((claims.auth_time as number) * 1000).toISOString(),
      userStatus: attributes.email_verified || 'CONFIRMED',
      twoFactorEnabled: attributes['custom:mfa'] === 'true',
      passkeysEnabled: attributes['custom:pless'] === 'true',
      groups: groups,
      isAdmin: isAdmin,
      picture: attributes.picture || (claims.picture as string) || '',
      banner: attributes['custom:banner'] || '',
      locale: attributes.locale || (claims.locale as string) || '',
      zoneinfo: attributes.zoneinfo || (claims.zoneinfo as string) || '',
      website: attributes.website || (claims.website as string) || '',
      gender: attributes.gender || (claims.gender as string) || '',
      aboutMe: attributes['custom:aboutme'] || '',
      preferences: preferences,
      notificationPreferences: notificationPreferences,
      publicProfilePreferences: publicProfilePreferences,
      fingerprint: fingerprintData,
      devices: devices,
      sessionStartedAt: claims.auth_time as number,
      sessionExpiresAt: claims.exp as number,
    };
  } catch (error: any) {
    console.error('General error in getUser, likely during device list or user attribute fetch:', error);
    // Clearing the cookie here is a safe fallback
    (await cookies()).set('auth_session', '', { expires: new Date(0), path: '/' });
    return null;
  }
});
