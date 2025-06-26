import 'server-only';
import { cache } from 'react';
import { CognitoIdentityProviderClient, AdminGetUserCommand } from "@aws-sdk/client-cognito-identity-provider";
import { parseISO } from 'date-fns';

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

// This function is cached per request, so you can call it multiple times
// in a request without making multiple API calls.
export const getUser = cache(async (): Promise<User> => {
  if (process.env.NODE_ENV === 'development') {
    console.log("Using mock user data for development.");
    return mockUser;
  }

  // In a real application, you would get the username from the user's session.
  // For this example, we'll hardcode it.
  const username = 'testuser'; 

  // Ensure environment variables are set
  if (!process.env.COGNITO_USER_POOL_ID || !process.env.AWS_REGION || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.error('Cognito environment variables are not fully set. Falling back to mock data.');
    return mockUser;
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
    console.error("Failed to fetch user from Cognito:", error);
    // Throw an error to signal that the production data source is failing.
    throw new Error(`Could not fetch user '${username}' from Cognito.`);
  }
});
