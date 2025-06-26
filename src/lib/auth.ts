import 'server-only';
import { cache } from 'react';
import { CognitoIdentityProviderClient, AdminGetUserCommand } from "@aws-sdk/client-cognito-identity-provider";
import { cookies } from 'next/headers';

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

  // If there's no session, there's no user.
  if (!session?.username) {
    return null;
  }

  // In a development environment, we can return mock data for convenience.
  if (process.env.NODE_ENV === 'development') {
    console.log("Using mock user data for development.");
    return { ...mockUser, email: session.email, username: session.username };
  }

  // In production, fetch the user from Cognito.
  const username = session.username; 

  if (!process.env.COGNITO_USER_POOL_ID || !process.env.AWS_REGION || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.error('Cognito environment variables are not fully set. Cannot fetch real user data.');
    return null;
  }

  const client = new CognitoIdentityProviderClient({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
  });

  const command = new AdminGetUserCommand({
    UserPoolId: process.env.COGNITO_USER_POOL_ID,
    Username: username,
  });

  try {
    const response = await client.send(command);

    if (!response.UserAttributes || !response.UserCreateDate || !response.UserStatus) {
        throw new Error('Incomplete user data received from Cognito.');
    }

    const attributes = response.UserAttributes.reduce((acc, attr) => {
        if (attr.Name) {
            acc[attr.Name] = attr.Value;
        }
        return acc;
    }, {} as Record<string, string | undefined>);

    const user: User = {
      username: response.Username ?? 'N/A',
      email: attributes.email ?? '',
      email_verified: attributes.email_verified === 'true',
      name: attributes.name ?? '',
      address: attributes.address ?? '',
      phone_number: attributes.phone_number ?? '',
      phone_number_verified: attributes.phone_number_verified === 'true',
      creationDate: response.UserCreateDate.toISOString(),
      userStatus: response.UserStatus,
      twoFactorEnabled: response.MFAOptions ? response.MFAOptions.length > 0 : false,
    };

    return user;

  } catch (error) {
    console.error(`Failed to fetch user '${username}' from Cognito:`, error);
    // If the user is not found in Cognito, invalidate the local session.
    cookies().set('auth_session', '', { expires: new Date(0) });
    return null;
  }
});
