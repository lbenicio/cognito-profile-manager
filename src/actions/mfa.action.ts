'use server';

import { generateURI } from 'otplib';
import QRCode from 'qrcode';
import { revalidatePath } from 'next/cache';
import {
  cognitoClient,
  AssociateSoftwareTokenCommand,
  VerifySoftwareTokenCommand,
  SetUserMFAPreferenceCommand,
  UpdateUserAttributesCommand,
} from '../lib/cognito';
import { getUser } from '../lib/auth';
import { getSession } from '../lib/session';
import { Logger } from '@/lib/logger';

const logger = new Logger('MFA');

export async function generateMfaSetup() {
  const user = await getUser();
  const session = await getSession();
  if (!user || !session?.accessToken) {
    throw new Error('Not authenticated');
  }

  const command = new AssociateSoftwareTokenCommand({
    AccessToken: session.accessToken,
  });

  const response = await cognitoClient.send(command);
  const secretCode = response.SecretCode;

  if (!secretCode) {
    throw new Error('Failed to get secret code from Cognito.');
  }

  const serviceName = 'Outpost';
  const otpauth = generateURI({
    issuer: serviceName,
    label: user.email,
    secret: secretCode,
  });
  const qrCodeDataUrl = await QRCode.toDataURL(otpauth);

  return { qrCodeDataUrl, secretCode };
}

export async function verifyAndEnableMfa(
  code: string
): Promise<{ success: boolean; message: string }> {
  const session = await getSession();
  if (!session?.accessToken) {
    throw new Error('Not authenticated');
  }

  try {
    const verifyCommand = new VerifySoftwareTokenCommand({
      AccessToken: session.accessToken,
      UserCode: code,
    });
    await cognitoClient.send(verifyCommand);

    const setMfaCommand = new SetUserMFAPreferenceCommand({
      AccessToken: session.accessToken,
      SoftwareTokenMfaSettings: {
        Enabled: true,
        PreferredMfa: true,
      },
    });
    await cognitoClient.send(setMfaCommand);

    const updateUserAttrCommand = new UpdateUserAttributesCommand({
      AccessToken: session.accessToken,
      UserAttributes: [{ Name: 'custom:mfa', Value: 'true' }],
    });
    await cognitoClient.send(updateUserAttrCommand);

    revalidatePath('/security');
    revalidatePath('/');

    return {
      success: true,
      message: 'Authenticator app enabled successfully.',
    };
  } catch (error: unknown) {
    logger.error('MFA Verification Error:', error);
    const errorName =
      error instanceof Error
        ? error.name
        : typeof error === 'object' && error !== null && 'name' in error
          ? String(error.name)
          : undefined;
    if (
      errorName === 'EnableSoftwareTokenMFAException' ||
      errorName === 'NotAuthorizedException'
    ) {
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

export async function disableMfa(): Promise<{
  success: boolean;
  message: string;
}> {
  const session = await getSession();
  if (!session?.accessToken) {
    throw new Error('Not authenticated');
  }

  try {
    const command = new SetUserMFAPreferenceCommand({
      AccessToken: session.accessToken,
      SoftwareTokenMfaSettings: {
        Enabled: false,
        PreferredMfa: false,
      },
    });
    await cognitoClient.send(command);

    const updateUserAttrCommand = new UpdateUserAttributesCommand({
      AccessToken: session.accessToken,
      UserAttributes: [{ Name: 'custom:mfa', Value: 'false' }],
    });
    await cognitoClient.send(updateUserAttrCommand);

    revalidatePath('/security');
    revalidatePath('/');

    return {
      success: true,
      message: 'Authenticator app disabled successfully.',
    };
  } catch (error) {
    logger.error('MFA Disable Error:', error);
    return {
      success: false,
      message: 'An unexpected error occurred while disabling MFA.',
    };
  }
}
