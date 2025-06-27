'use server';

import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import { revalidatePath } from 'next/cache';
import {
  cognitoClient,
  AssociateSoftwareTokenCommand,
  VerifySoftwareTokenCommand,
  SetUserMFAPreferenceCommand,
  UpdateUserAttributesCommand,
} from './cognito';
import { getUser, getSession } from './auth';

export async function generateMfaSetup() {
  const user = await getUser();
  const session = await getSession();
  if (!user || !session?.access_token) {
    throw new Error('Not authenticated');
  }

  const command = new AssociateSoftwareTokenCommand({
    AccessToken: session.access_token,
  });

  const response = await cognitoClient.send(command);
  const secretCode = response.SecretCode;

  if (!secretCode) {
    throw new Error('Failed to get secret code from Cognito.');
  }

  const serviceName = 'Outpost'; // Should match your app name
  const otpauth = authenticator.keyuri(
    user.email,
    serviceName,
    secretCode
  );
  const qrCodeDataUrl = await QRCode.toDataURL(otpauth);

  return { qrCodeDataUrl, secretCode };
}

export async function verifyAndEnableMfa(
  code: string
): Promise<{ success: boolean; message: string }> {
  const session = await getSession();
  if (!session?.access_token) {
    throw new Error('Not authenticated');
  }

  try {
    const verifyCommand = new VerifySoftwareTokenCommand({
      AccessToken: session.access_token,
      UserCode: code,
    });
    await cognitoClient.send(verifyCommand);

    const setMfaCommand = new SetUserMFAPreferenceCommand({
      AccessToken: session.access_token,
      SoftwareTokenMfaSettings: {
        Enabled: true,
        PreferredMfa: true,
      },
    });
    await cognitoClient.send(setMfaCommand);
    
    const updateUserAttrCommand = new UpdateUserAttributesCommand({
        AccessToken: session.access_token,
        UserAttributes: [{ Name: 'custom:mfa', Value: 'true' }],
    });
    await cognitoClient.send(updateUserAttrCommand);

    revalidatePath('/security');
    revalidatePath('/');

    return { success: true, message: 'Authenticator app enabled successfully.' };
  } catch (error: any) {
    console.error('MFA Verification Error:', error);
    if (error.name === 'EnableSoftwareTokenMFAException' || error.name === 'NotAuthorizedException') {
      return {
        success: false,
        message: 'The code is incorrect or has expired. Please try again.',
      };
    }
    return {
      success: false,
      message: 'An unexpected error occurred while enabling MFA.',
    };
  }
}

export async function disableMfa(): Promise<{ success: boolean; message: string }> {
  const session = await getSession();
  if (!session?.access_token) {
    throw new Error('Not authenticated');
  }

  try {
    const command = new SetUserMFAPreferenceCommand({
      AccessToken: session.access_token,
      SoftwareTokenMfaSettings: {
        Enabled: false,
        PreferredMfa: false,
      },
    });
    await cognitoClient.send(command);

    const updateUserAttrCommand = new UpdateUserAttributesCommand({
        AccessToken: session.access_token,
        UserAttributes: [{ Name: 'custom:mfa', Value: 'false' }],
    });
    await cognitoClient.send(updateUserAttrCommand);

    revalidatePath('/security');
    revalidatePath('/');

    return { success: true, message: 'Authenticator app disabled successfully.' };
  } catch (error) {
    console.error('MFA Disable Error:', error);
    return {
      success: false,
      message: 'An unexpected error occurred while disabling MFA.',
    };
  }
}
