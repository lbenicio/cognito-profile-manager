import 'server-only';
import { cache } from 'react';
import {
  cognitoClient,
  GetUserCommand,
  ListWebAuthnCredentialsCommand,
} from '@/lib/cognito';
import { getSession } from '@/lib/session';
import { getMockUser } from '@/lib/mock-data';
import { Logger } from '@/lib/logger';
import type {
  User,
  UserPreferences,
  NotificationPreferences,
  PublicProfilePreferences,
  Device,
  Fingerprint,
} from '@/types/user/user.types';

const logger = new Logger('AUTH');

// Re-export types for backward compatibility
export type {
  User,
  UserPreferences,
  NotificationPreferences,
  PublicProfilePreferences,
  Device,
  Fingerprint,
} from '@/types/user/user.types';

export type Session = {
  accessToken: string;
  refreshToken: string;
  claims: import('jose').JWTPayload;
  isMock?: boolean;
  username?: string;
  sessionId: string;
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

export const getUser = cache(async (): Promise<User | null> => {
  const session = await getSession();

  if (session?.isMock) {
    logger.info('Using mock user data for development.');
    const mockUser = getMockUser(session.username);
    return {
      ...mockUser,
      username: session.username || 'mockuser_dev',
      sessionStartedAt: (session.claims.auth_time as number) || 0,
      sessionExpiresAt: (session.claims.exp as number) || 0,
    };
  }

  if (!session?.accessToken || !session.claims) {
    return null;
  }

  try {
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

    const { claims } = session;
    const adminGroupName = process.env.COGNITO_ADMIN_GROUP_NAME || 'admins';
    const groupsClaimKey =
      process.env.COGNITO_GROUPS_CLAIM_KEY || 'cognito:groups';
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
        logger.error(
          'Failed to parse user preferences from GetUser API call',
          e
        );
      }
    }

    let publicProfilePreferences: PublicProfilePreferences = {
      ...defaultPublicProfilePreferences,
    };
    const publicProfileClaim = attributes['custom:public-profile'];
    if (publicProfileClaim) {
      try {
        const parsedPrefs = JSON.parse(publicProfileClaim);
        publicProfilePreferences = {
          isPublic:
            parsedPrefs.isPublic ?? defaultPublicProfilePreferences.isPublic,
          publicFields: {
            ...defaultPublicProfilePreferences.publicFields,
            ...(parsedPrefs.publicFields || {}),
          },
        };
      } catch (e) {
        logger.error(
          'Failed to parse public profile preferences from GetUser API call',
          e
        );
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
        logger.error(
          'Failed to parse user fingerprint from GetUser API call',
          e
        );
      }
    }

    let devices: Device[] = [];
    try {
      const listCredentialsCommand = new ListWebAuthnCredentialsCommand({
        AccessToken: session.accessToken,
      });
      const credentialsResponse = await cognitoClient.send(
        listCredentialsCommand
      );

      devices = (credentialsResponse.Credentials || [])
        .map((credential) => {
          if (!credential.CredentialId) return null;

          const name = `Passkey on ${credential.FriendlyCredentialName ? credential.FriendlyCredentialName : 'Unknown Device'}`;

          return {
            key: credential.CredentialId,
            name: name,
            createDate: credential.CreatedAt?.toISOString(),
            lastAuthDate: undefined,
          } as Device;
        })
        .filter((d): d is Device => d !== null);
    } catch (e: any) {
      logger.error('Could not fetch WebAuthn credentials for user:', e);
    }

    let messages: string[] = [];
    const warningsClaim = attributes['custom:warnings'];
    if (warningsClaim) {
      try {
        const parsedWarnings = JSON.parse(warningsClaim);
        if (
          Array.isArray(parsedWarnings) &&
          parsedWarnings.every((item) => typeof item === 'string')
        ) {
          messages = parsedWarnings;
        }
      } catch (e) {
        logger.error(
          'Failed to parse user messages from "custom:warnings" attribute',
          e
        );
      }
    }

    return {
      sub: claims.sub as string,
      username:
        cognitoUser.Username || (claims['cognito:username'] as string) || '',
      email: attributes.email || (claims.email as string) || '',
      email_verified: attributes.email_verified === 'true',
      name:
        [freshGivenName, freshFamilyName].filter(Boolean).join(' ') ||
        (claims.name as string) ||
        '',
      address: attributes.address || '',
      phone_number:
        attributes.phone_number || (claims.phone_number as string) || '',
      phone_number_verified: attributes.phone_number_verified === 'true',
      birthdate: attributes.birthdate || '',
      creationDate: new Date((claims.auth_time as number) * 1000).toISOString(),
      userStatus:
        attributes.email_verified === 'true' ? 'CONFIRMED' : 'UNCONFIRMED',
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
      sessionStartedAt: (claims.auth_time as number) || 0,
      sessionExpiresAt: (claims.exp as number) || 0,
      messages: messages,
    };
  } catch (error: any) {
    logger.error(
      'General error in getUser, likely during device list or user attribute fetch:',
      error
    );
    // Do not delete session here. A temporary Cognito error shouldn't log out the user.
    // The session will be invalid for this request, and they can retry.
    return null;
  }
});
