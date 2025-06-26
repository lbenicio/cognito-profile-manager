'use server';

import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  type VerifiedRegistrationResponse,
} from '@simplewebauthn/server';
import type {
  RegistrationResponseJSON,
  PublicKeyCredentialCreationOptionsJSON,
  AuthenticatorDevice,
} from '@simplewebauthn/types';
import { isoBase64URL, isoUint8Array } from '@simplewebauthn/server/helpers';
import { cookies } from 'next/headers';
import { cognitoClient } from './cognito';
import {
  GetUserCommand,
  UpdateUserAttributesCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { getSession, getUser } from './auth';
import { revalidatePath } from 'next/cache';

const rpName = process.env.NEXT_PUBLIC_RP_NAME || 'Outpost';
const rpID = process.env.NEXT_PUBLIC_RP_ID;
const origin = process.env.NEXT_PUBLIC_RP_ORIGIN;

if (!rpID) throw new Error('Missing NEXT_PUBLIC_RP_ID env var');
if (!origin) throw new Error('Missing NEXT_PUBLIC_RP_ORIGIN env var');

export interface Passkey extends AuthenticatorDevice {
  id: string; // base64url encoded credentialID
  name: string;
  createdAt: string;
}

async function getPasskeys(accessToken: string): Promise<Passkey[]> {
  const command = new GetUserCommand({ AccessToken: accessToken });
  const response = await cognitoClient.send(command);
  const passkeysAttr = response.UserAttributes?.find(
    (attr) => attr.Name === 'custom:passkeys'
  );
  if (passkeysAttr?.Value) {
    try {
      const passkeys = JSON.parse(passkeysAttr.Value);
      // Ensure credentialID and credentialPublicKey are Buffers
      return passkeys.map((key: any) => ({
          ...key,
          credentialID: isoUint8Array.from(key.credentialID, 'base64url'),
          credentialPublicKey: isoUint8Array.from(key.credentialPublicKey, 'base64url')
      }));
    } catch {
      return [];
    }
  }
  return [];
}

async function savePasskeys(accessToken: string, passkeys: Passkey[]) {
    // Before saving, convert Buffers to base64url strings for JSON serialization
    const serializablePasskeys = passkeys.map(key => ({
        ...key,
        credentialID: isoBase64URL.from(key.credentialID),
        credentialPublicKey: isoBase64URL.from(key.credentialPublicKey),
    }));

    const command = new UpdateUserAttributesCommand({
        AccessToken: accessToken,
        UserAttributes: [
        {
            Name: 'custom:passkeys',
            Value: JSON.stringify(serializablePasskeys),
        },
        {
            Name: 'custom:pless',
            Value: passkeys.length > 0 ? 'true' : 'false',
        },
        ],
    });
    await cognitoClient.send(command);
}

export async function listPasskeysForUser(): Promise<Omit<Passkey, 'credentialPublicKey' | 'credentialID' | 'counter'>[]> {
  const session = await getSession();
  if (!session?.access_token) throw new Error('Not authenticated');

  const passkeys = await getPasskeys(session.access_token);
  return passkeys.map(({ name, createdAt, transports }) => ({ id: name, name, createdAt, transports }));
}


export async function generateRegistrationOptionsServer(): Promise<PublicKeyCredentialCreationOptionsJSON> {
  const user = await getUser();
  const session = await getSession();
  if (!user || !session?.access_token) throw new Error('Not authenticated');

  const userPasskeys = await getPasskeys(session.access_token);

  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userID: user.username,
    userName: user.email,
    timeout: 60000,
    attestationType: 'none',
    excludeCredentials: userPasskeys.map((passkey) => ({
      id: passkey.credentialID,
      type: 'public-key',
      transports: passkey.transports,
    })),
    authenticatorSelection: {
      residentKey: 'preferred',
      userVerification: 'preferred',
    },
  });

  cookies().set('passkey_registration_challenge', options.challenge, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    sameSite: 'strict',
    maxAge: options.timeout / 1000,
  });

  return options;
}

export async function verifyRegistrationServer(
  response: RegistrationResponseJSON,
  passkeyName: string,
): Promise<{ success: boolean; message: string }> {
    const user = await getUser();
    const session = await getSession();
    if (!user || !session?.access_token) throw new Error('Not authenticated');

    const challenge = cookies().get('passkey_registration_challenge')?.value;
    if (!challenge) {
        return { success: false, message: "Challenge expired or was not found." };
    }

    let verification: VerifiedRegistrationResponse;
    try {
        verification = await verifyRegistrationResponse({
            response,
            expectedChallenge: challenge,
            expectedOrigin: origin,
            expectedRPID: rpID,
            requireUserVerification: true,
        });
    } catch (error: any) {
        console.error("Passkey verification error:", error);
        return { success: false, message: error.message };
    }
    
    const { verified, registrationInfo } = verification;

    if (!verified || !registrationInfo) {
        return { success: false, message: 'Could not verify passkey registration.' };
    }
    
    const { credentialPublicKey, credentialID, counter } = registrationInfo;
    const existingPasskeys = await getPasskeys(session.access_token);

    if (existingPasskeys.some(key => isoBase64URL.from(key.credentialID) === isoBase64URL.from(credentialID))) {
        return { success: false, message: "This passkey is already registered." };
    }

    const newPasskey: Passkey = {
        id: isoBase64URL.from(credentialID),
        credentialID,
        credentialPublicKey,
        counter,
        transports: response.response.transports,
        name: passkeyName,
        createdAt: new Date().toISOString(),
    };
    
    await savePasskeys(session.access_token, [...existingPasskeys, newPasskey]);

    cookies().delete('passkey_registration_challenge');
    revalidatePath('/profile');
    
    return { success: true, message: 'Passkey registered successfully.' };
}


export async function removePasskey(passkeyId: string): Promise<{ success: boolean; message: string }> {
    const session = await getSession();
    if (!session?.access_token) {
        throw new Error('Not authenticated');
    }

    try {
        const passkeys = await getPasskeys(session.access_token);
        const updatedPasskeys = passkeys.filter(key => key.name !== passkeyId);

        if (passkeys.length === updatedPasskeys.length) {
            return { success: false, message: "Passkey not found." };
        }

        await savePasskeys(session.access_token, updatedPasskeys);
        
        revalidatePath('/profile');

        return { success: true, message: 'Passkey removed successfully.' };
    } catch (error: any) {
        console.error("Failed to remove passkey:", error);
        return { success: false, message: "An error occurred while removing the passkey." };
    }
}
