import 'server-only';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { jwtVerify, createRemoteJWKSet } from 'jose';
import { GetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import { cognitoClient } from '@/lib/cognito';

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
  const session = await getSession();

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

  try {
    // In production, first verify the JWT to confirm the session is valid.
    const wellknownUrl = process.env.NEXT_PUBLIC_COGNITO_WELLKNOWN;
    if (!wellknownUrl) throw new Error('Missing NEXT_PUBLIC_COGNITO_WELLKNOWN env var');
    
    const wellknownResponse = await fetch(wellknownUrl, { cache: 'no-store' });
    if (!wellknownResponse.ok) throw new Error('Failed to fetch OpenID configuration');
    const wellknown = await wellknownResponse.json();

    const jwksUri = wellknown.jwks_uri;
    const JWKS = createRemoteJWKSet(new URL(jwksUri));

    const { payload } = await jwtVerify(session.id_token, JWKS, {
      issuer: wellknown.issuer,
      audience: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
    });

    // Initialize a base user object with claims from the (potentially stale) ID token.
    const adminGroupName = process.env.COGNITO_ADMIN_GROUP_NAME || 'admins';
    const groupsClaimKey = process.env.COGNITO_GROUPS_CLAIM_KEY || 'cognito:groups';
    const groups = (payload[groupsClaimKey] as string[]) || [];
    const isAdmin = groups.includes(adminGroupName);
    const addressClaim = payload.address as { formatted?: string } | undefined;
    const givenName = (payload.given_name as string) || '';
    const familyName = (payload.family_name as string) || '';
    
    let preferences: UserPreferences = { ...defaultPreferences };
    const sessionClaim = payload['custom:session'] as string | undefined;
    if (sessionClaim) {
        try {
            const parsedPrefs = JSON.parse(sessionClaim);
            preferences = { ...preferences, ...parsedPrefs };
        } catch (e) {
            console.error('Failed to parse user preferences from custom:session claim', e);
        }
    }


    let user: User = {
      username: (payload['cognito:username'] as string) || '',
      email: (payload.email as string) || '',
      email_verified: (payload.email_verified as boolean) || false,
      name: [givenName, familyName].filter(Boolean).join(' '),
      address: addressClaim?.formatted ?? '',
      phone_number: (payload.phone_number as string) || '',
      phone_number_verified: (payload.phone_number_verified as boolean) || false,
      creationDate: new Date((payload.auth_time as number) * 1000).toISOString(),
      userStatus: 'CONFIRMED', // Placeholder, will be updated
      twoFactorEnabled: false, // Placeholder, will be updated
      passkeysEnabled: false, // Placeholder, will be updated
      groups: groups,
      isAdmin: isAdmin,
      picture: (payload.picture as string) || '',
      banner: (payload['custom:banner'] as string) || '',
      locale: (payload.locale as string) || '',
      zoneinfo: (payload.zoneinfo as string) || '',
      website: (payload.website as string) || '',
      gender: (payload.gender as string) || '',
      aboutMe: (payload['custom:aboutme'] as string) || '',
      preferences: preferences,
      notificationPreferences: { ...defaultNotificationPreferences },
      publicProfilePreferences: { ...defaultPublicProfilePreferences },
      fingerprint: [],
      passkeys: [],
    };
    
    // Now, use the access token to fetch the most up-to-date user attributes from Cognito.
    if (session.access_token) {
        const getUserCommand = new GetUserCommand({ AccessToken: session.access_token });
        const cognitoUser = await cognitoClient.send(getUserCommand);

        const attributes = cognitoUser.UserAttributes?.reduce((acc, attr) => {
            if (attr.Name && attr.Value) {
                acc[attr.Name] = attr.Value;
            }
            return acc;
        }, {} as Record<string, string>);

        // Overwrite the initial user data with fresh attributes from the API call.
        if (attributes) {
             const freshGivenName = attributes.given_name || '';
             const freshFamilyName = attributes.family_name || '';
             let notificationPreferences: NotificationPreferences = { ...defaultNotificationPreferences };
             let publicProfilePreferences: PublicProfilePreferences = { ...defaultPublicProfilePreferences };

             // Re-parse preferences from the absolute latest data
             if (attributes['custom:session']) {
                 try {
                     const parsedPrefs = JSON.parse(attributes['custom:session']);
                     preferences = { ...defaultPreferences, ...parsedPrefs };
                 } catch (e) {
                     console.error('Failed to parse user preferences from GetUser API call', e);
                 }
             }
            
            // Re-parse public profile preferences from the absolute latest data
            const publicProfileClaim = attributes['custom:public-profile'];
            if (publicProfileClaim) {
                try {
                    const parsedPrefs = JSON.parse(publicProfileClaim);
                    // Deep merge to handle cases where new fields are added to the defaults later
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

             // Parse notification preferences
             notificationPreferences = {
                email: attributes['custom:email-notification'] === 'true',
                app: attributes['custom:app-notification'] === 'true',
                telegram: attributes['custom:tlgm-notification'] === 'true',
                user: attributes['custom:user-notifications'] === 'true',
                system: attributes['custom:system-notifications'] === 'true',
                marketing: attributes['custom:mkt-notifications'] === 'true',
             };

             let fingerprintData: Fingerprint[] = [];
             const fingerprintClaim = attributes['custom:fingerprint'];
             if (fingerprintClaim) {
                 try {
                     fingerprintData = JSON.parse(fingerprintClaim);
                 } catch (e) {
                     console.error('Failed to parse user fingerprint from GetUser API call', e);
                 }
             }
             
             let passkeysData: PasskeyInfo[] = [];
             const passkeysClaim = attributes['custom:passkeys'];
             if (passkeysClaim) {
                 try {
                     passkeysData = JSON.parse(passkeysClaim);
                 } catch (e) {
                     console.error('Failed to parse user passkeys from GetUser API call', e);
                 }
             }

             user = {
                ...user,
                username: cognitoUser.Username || user.username,
                userStatus: cognitoUser.UserStatus || user.userStatus,
                email: attributes.email || user.email,
                email_verified: attributes.email_verified === 'true',
                name: [freshGivenName, freshFamilyName].filter(Boolean).join(' ') || user.name,
                address: attributes.address || user.address,
                phone_number: attributes.phone_number || user.phone_number,
                phone_number_verified: attributes.phone_number_verified === 'true',
                picture: attributes.picture || user.picture,
                banner: attributes['custom:banner'] || user.banner,
                locale: attributes.locale || user.locale,
                zoneinfo: attributes.zoneinfo || user.zoneinfo,
                website: attributes.website || user.website,
                gender: attributes.gender || user.gender,
                aboutMe: attributes['custom:aboutme'] || user.aboutMe,
                preferences: preferences,
                notificationPreferences: notificationPreferences,
                publicProfilePreferences: publicProfilePreferences,
                fingerprint: fingerprintData,
                passkeys: passkeysData,
                // Crucially, update the custom attributes from the fresh data
                twoFactorEnabled: attributes['custom:mfa'] === 'true',
                passkeysEnabled: attributes['custom:pless'] === 'true',
             };
        }
    }

    return user;

  } catch (error: any) {
    console.error("Authentication or user data fetch error:", error);
    // The invalid cookie is now handled by the middleware, so we just return null.
    return null;
  }
});
