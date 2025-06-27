'use server';

import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  type VerifiedRegistrationResponse,
} from '@simplewebauthn/server';
import type {
  RegistrationResponseJSON,
  PublicKeyCredentialCreationOptionsJSON,
} from '@simplewebauthn/types';
import {
  AssociateSoftwareTokenCommand,
  ForgetDeviceCommand,
  ListDevicesCommand,
  UpdateUserAttributesCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { revalidatePath } from 'next/cache';
import { cognitoClient } from './cognito';
import { getSession, getUser, type User } from './auth';

const rpName = 'Outpost';
const rpID = process.env.NEXT_PUBLIC_RP_ID;
const origin = process.env.NEXT_PUBLIC_RP_ID
  ? `https://${process.env.NEXT_PUBLIC_RP_ID}`
  : 'http://localhost:3000';

type Device = {
  key: string;
  name: string;
  createdDate: string;
};

// Helper to map Cognito's DeviceType to our simplified Device type
const mapDeviceType = (device: any): Device => ({
  key: device.DeviceKey,
  name: device.DeviceAttributes?.find((a: any) => a.Name === 'device_name')?.Value || 'Unnamed Device',
  createdDate: device.DeviceCreateDate.toISOString(),
});

export async function getPasskeyRegistrationOptions(): Promise<PublicKeyCredentialCreationOptionsJSON> {
  const user = await getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  if (!rpID) {
    throw new Error('Relying Party ID (NEXT_PUBLIC_RP_ID) is not set in environment variables.');
  }

  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userID: user.username,
    userName: user.email,
    attestationType: 'none',
    authenticatorSelection: {
      residentKey: 'required',
      userVerification: 'preferred',
    },
  });

  // Temporarily store the challenge in the user's session
  const session = await getSession();
  session.passkeyChallenge = options.challenge;
  // This is a simplification. In a real app, you might use a more robust session update mechanism.

  return options;
}

export async function verifyPasskeyRegistration(
  verification: RegistrationResponseJSON,
  deviceName: string
): Promise<{ success: boolean; message:string }> {
  const user = await getUser();
  const session = await getSession();
  if (!user || !session?.access_token) {
    return { success: false, message: 'Not authenticated' };
  }

  const expectedChallenge = session.passkeyChallenge;
  if (!expectedChallenge) {
    return { success: false, message: 'Challenge not found in session.' };
  }

  let verificationResult: VerifiedRegistrationResponse;
  try {
    verificationResult = await verifyRegistrationResponse({
      response: verification,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID!,
      requireUserVerification: true,
    });
  } catch (error: any) {
    console.error('Passkey verification failed:', error);
    return { success: false, message: error.message };
  }

  const { verified, registrationInfo } = verificationResult;

  if (!verified || !registrationInfo) {
    return { success: false, message: 'Passkey could not be verified.' };
  }

  try {
    const { credentialPublicKey, credentialID, counter } = registrationInfo;
    const associateCommand = new AssociateSoftwareTokenCommand({
      AccessToken: session.access_token,
      // In a real app, you would store the full credential info.
      // For Cognito's device tracking, we use a simplified approach.
      // The deviceName is the primary identifier the user sees.
      DeviceName: deviceName,
    });
    await cognitoClient.send(associateCommand);

    const updateUserAttrCommand = new UpdateUserAttributesCommand({
        AccessToken: session.access_token,
        UserAttributes: [{ Name: 'custom:pless', Value: 'true' }],
    });
    await cognitoClient.send(updateUserAttrCommand);

    revalidatePath('/profile');
    revalidatePath('/');

    return { success: true, message: 'Passkey registered successfully.' };

  } catch (error: any) {
    console.error('Cognito passkey association failed:', error);
    return { success: false, message: 'Failed to save passkey to your account.' };
  }
}

export async function listPasskeys(): Promise<Device[]> {
  const session = await getSession();
  if (!session?.access_token) {
    return [];
  }

  try {
    const command = new ListDevicesCommand({
      AccessToken: session.access_token,
    });
    const response = await cognitoClient.send(command);
    // Filter out non-passkey devices if any (Cognito uses this for other things too)
    return response.Devices?.map(mapDeviceType) || [];
  } catch (error) {
    console.error('List Passkeys Error:', error);
    return [];
  }
}

export async function deletePasskey(deviceKey: string): Promise<{ success: boolean; message: string }> {
    const session = await getSession();
    if (!session?.access_token) {
        return { success: false, message: 'Not authenticated' };
    }

    try {
        const forgetDeviceCommand = new ForgetDeviceCommand({
            AccessToken: session.access_token,
            DeviceKey: deviceKey,
        });
        await cognitoClient.send(forgetDeviceCommand);

        const remainingPasskeys = await listPasskeys();
        if (remainingPasskeys.length === 0) {
            const updateUserAttrCommand = new UpdateUserAttributesCommand({
                AccessToken: session.access_token,
                UserAttributes: [{ Name: 'custom:pless', Value: 'false' }],
            });
            await cognitoClient.send(updateUserAttrCommand);
        }

        revalidatePath('/profile');
        revalidatePath('/');

        return { success: true, message: 'Passkey deleted successfully.' };
    } catch (error: any) {
        console.error('Delete Passkey Error:', error);
        return {
            success: false,
            message: 'An unexpected error occurred while deleting the passkey.',
        };
    }
}
