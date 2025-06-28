'use server';

import { cognitoClient, ListWebAuthnCredentialsCommand } from './cognito';
import { getSession, getUser } from './auth';

export async function listCognitoPasskeys(
  username: string
): Promise<{ success: boolean; message: string; data?: any }> {
  if (process.env.NODE_ENV !== 'development') {
    return {
      success: false,
      message: 'This action is only available in development.',
    };
  }

  const user = await getUser();
  if (!user?.isAdmin) {
    return { success: false, message: 'Not authorized. Admin required.' };
  }

  const userPoolIdWellKnown = process.env.NEXT_PUBLIC_COGNITO_WELLKNOWN;
  if (!userPoolIdWellKnown) {
    return {
      success: false,
      message: 'Cognito Well-Known URL is not configured.',
    };
  }

  const session = await getSession();

  if (!session?.accessToken) {
    return {
      success: false,
      message: 'User session not found. Please log in.',
    };
  }

  try {
    const command = new ListWebAuthnCredentialsCommand({
      AccessToken: session.accessToken,
    });
    const response = await cognitoClient.send(command);

    console.log('[DEV] WebAuthn Credentials:', response.Credentials);

    return {
      success: true,
      message: `Found ${response.Credentials?.length || 0} passkeys for ${username}. Check the server console for details.`,
      data: response.Credentials,
    };
  } catch (error: any) {
    console.error('List WebAuthn Credentials Error:', error);
    return {
      success: false,
      message: `Failed to list passkeys: ${error.name} - ${error.message}. Ensure your server's IAM role has 'cognito-idp:ListWebAuthnCredentials' permission.`,
    };
  }
}
