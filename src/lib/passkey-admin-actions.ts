
'use server';

import {
  cognitoClient,
  ListWebAuthnCredentialsCommand,
} from './cognito';
import { getUser } from './auth';

export async function listCognitoPasskeys(
  username: string
): Promise<{ success: boolean; message: string; data?: any }> {
  if (process.env.NODE_ENV !== 'development') {
    return { success: false, message: 'This action is only available in development.' };
  }
  
  const user = await getUser();
  if (!user?.isAdmin) {
    return { success: false, message: 'Not authorized. Admin required.' };
  }

  const userPoolIdWellKnown = process.env.NEXT_PUBLIC_COGNITO_WELLKNOWN;
  if (!userPoolIdWellKnown) {
    return { success: false, message: 'Cognito Well-Known URL is not configured.' };
  }
  
  // Example URL: https://cognito-idp.{region}.amazonaws.com/{userPoolId}/.well-known/openid-configuration
  // The user pool ID is the 5th component of the path.
  const userPoolId = userPoolIdWellKnown.split('/')[4];
  
  if (!userPoolId) {
     return { success: false, message: 'Could not derive User Pool ID from Well-Known URL.' };
  }

  try {
    const command = new ListWebAuthnCredentialsCommand({
      UserPoolId: userPoolId,
      Username: username,
    });
    const response = await cognitoClient.send(command);
    
    console.log('[DEV] WebAuthn Credentials:', response.Credentials);

    return { 
        success: true, 
        message: `Found ${response.Credentials?.length || 0} passkeys for ${username}. Check the server console for details.`,
        data: response.Credentials 
    };
  } catch (error: any) {
    console.error('List WebAuthn Credentials Error:', error);
    return {
      success: false,
      message: `Failed to list passkeys: ${error.name} - ${error.message}. Ensure your server's IAM role has 'cognito-idp:ListWebAuthnCredentials' permission.`,
    };
  }
}
