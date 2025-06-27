'use server';

import {
  AssociateSoftwareTokenCommand,
  VerifySoftwareTokenCommand,
  SetUserMFAPreferenceCommand,
  UpdateUserAttributesCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import type { RegistrationResponseJSON } from '@simplewebauthn/types';
import { cognitoClient } from './cognito';
import { getUser, getSession } from './auth';
import { revalidatePath } from 'next/cache';

// This function starts the passkey registration process by getting a challenge from Cognito.
export async function generatePasskeyRegistrationOptions() {
  const user = await getUser();
  const session = await getSession();
  if (!user || !session?.access_token) {
    throw new Error('Not authenticated');
  }

  // The Relying Party ID should be the effective domain of your application.
  // The browser will enforce this. For local dev, it's often 'localhost'.
  const rpId = process.env.NEXT_PUBLIC_RP_ID;
  if (!rpId) {
    throw new Error('Relying Party ID (NEXT_PUBLIC_RP_ID) is not set in environment variables.');
  }

  try {
    // This Cognito command initiates the process for adding a FIDO2/WebAuthn device.
    const command = new AssociateSoftwareTokenCommand({
      AccessToken: session.access_token,
    });
    const response = await cognitoClient.send(command);

    // Cognito returns a 'Session' which we will use as the 'challenge'.
    const challenge = response.Session;
    if (!challenge) {
      throw new Error('Failed to get a challenge session from Cognito.');
    }

    return {
      challenge, // This is Cognito's session, which acts as our challenge
      rp: { id: rpId, name: 'Outpost' },
      user: {
        id: user.username, // Use a stable user identifier
        name: user.email,
        displayName: user.name,
      },
      pubKeyCredParams: [
        { alg: -7, type: 'public-key' as const }, // ES256
        { alg: -257, type: 'public-key' as const }, // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform' as const, // or 'cross-platform'
        requireResidentKey: true,
        userVerification: 'required' as const,
      },
      timeout: 60000,
      attestation: 'direct' as const,
    };
  } catch (error) {
    console.error('Error generating passkey registration options:', error);
    throw new Error('Could not start passkey registration process.');
  }
}

// This function verifies the passkey registration with Cognito.
export async function verifyPasskeyRegistration(
  response: RegistrationResponseJSON,
  deviceName: string,
  cognitoSession: string
) {
  const session = await getSession();
  if (!session?.access_token) {
    throw new Error('Not authenticated');
  }

  try {
    const verifyCommand = new VerifySoftwareTokenCommand({
      AccessToken: session.access_token,
      Session: cognitoSession,
      UserCode: JSON.stringify(response), // The full response from the authenticator
      FriendlyDeviceName: deviceName,
    });
    await cognitoClient.send(verifyCommand);

    // After successful verification, set passkeys as a preferred MFA method.
    const setMfaCommand = new SetUserMFAPreferenceCommand({
      AccessToken: session.access_token,
      SoftwareTokenMfaSettings: {
        Enabled: true,
        PreferredMfa: true,
      },
    });
    await cognitoClient.send(setMfaCommand);
    
    // And update our custom attribute to reflect that passkeys are enabled.
    const updateUserAttrCommand = new UpdateUserAttributesCommand({
      AccessToken: session.access_token,
      UserAttributes: [{ Name: 'custom:pless', Value: 'true' }],
    });
    await cognitoClient.send(updateUserAttrCommand);

    revalidatePath('/profile');
    revalidatePath('/');
    
    return { success: true };
  } catch (error) {
    console.error('Error verifying passkey:', error);
    return { success: false, message: 'Verification failed. The passkey might already be registered or the request timed out.' };
  }
}
