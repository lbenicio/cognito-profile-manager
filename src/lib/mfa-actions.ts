'use server';

import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import { cookies } from 'next/headers';
import { EncryptJWT, jwtDecrypt } from 'jose';
import { revalidatePath } from 'next/cache';
import { getUser } from './auth';

// This secret should be a 32-byte string stored securely in environment variables.
// It's used to encrypt the user-specific TOTP secret before storing it in a cookie.
const JWE_SECRET_STRING = process.env.TOTP_SECRET_ENCRYPTION_KEY;
if (!JWE_SECRET_STRING || JWE_SECRET_STRING.length < 32) {
    throw new Error('TOTP_SECRET_ENCRYPTION_KEY must be set in .env and be at least 32 characters long.');
}
const JWE_SECRET = new TextEncoder().encode(JWE_SECRET_STRING);
const JWE_ALG = 'dir';
const JWE_ENC = 'A256GCM';

// Helper to encrypt the TOTP secret for storage in a cookie.
async function encrypt(payload: Record<string, unknown>) {
  return new EncryptJWT(payload)
    .setProtectedHeader({ alg: JWE_ALG, enc: JWE_ENC })
    .setIssuedAt()
    .setExpirationTime('10m') // The setup flow is valid for 10 minutes.
    .encrypt(JWE_SECRET);
}

// Helper to decrypt the TOTP secret from the cookie.
async function decrypt(jwe: string) {
  const { payload } = await jwtDecrypt(jwe, JWE_SECRET);
  return payload;
}

export async function generateMfaSetup() {
  const user = await getUser();
  if (!user) {
    throw new Error('Not authenticated');
  }

  // Generate a new secret for the user.
  const secret = authenticator.generateSecret();
  const serviceName = 'Outpost'; // Should match your app name
  const otpauth = authenticator.keyuri(user.email, serviceName, secret);
  const qrCodeDataUrl = await QRCode.toDataURL(otpauth);
  
  // Encrypt the user's secret and store it in a temporary cookie.
  const jwe = await encrypt({ secret });
  cookies().set('mfa_setup_secret', jwe, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 600, // 10 minutes
    path: '/',
    sameSite: 'lax',
  });

  return { qrCodeDataUrl };
}

export async function verifyAndEnableMfa(code: string): Promise<{ success: boolean, message: string }> {
  const user = await getUser();
  if (!user) throw new Error('Not authenticated');

  const secretCookie = cookies().get('mfa_setup_secret')?.value;
  if (!secretCookie) throw new Error('MFA setup session expired.');
  
  const { secret } = await decrypt(secretCookie) as { secret: string };
  if (!secret) throw new Error('Invalid MFA setup session.');

  const isValid = authenticator.verify({ token: code, secret });
  
  if (!isValid) {
    return { success: false, message: 'The code is incorrect. Please try again.' };
  }

  // In a real app, you would call your identity provider (e.g., Cognito) to:
  // 1. Associate the TOTP device with the user using the `secret`.
  // 2. Set MFA as the preferred method.
  // 3. Update the user attribute `custom:mfa` to 'true'.
  console.log(`Simulating enabling MFA for user ${user.username}.`);
  console.log(`In a real app, this action would update the user's 'custom:mfa' attribute to true.`);


  // Clear the temporary cookie.
  cookies().set('mfa_setup_secret', '', { expires: new Date(0) });

  // Revalidate the profile page to get the updated user state.
  revalidatePath('/profile');
  revalidatePath('/'); // Also revalidate dashboard

  return { success: true, message: 'Authenticator app enabled successfully.' };
}

export async function disableMfa(): Promise<{ success: boolean, message: string }> {
    const user = await getUser();
    if (!user) throw new Error('Not authenticated');

    // In a real app, you would call your identity provider to disable MFA for the user.
    // This typically involves removing the TOTP device and setting `custom:mfa` to 'false'.
    console.log(`Simulating disabling MFA for user ${user.username}.`);
    console.log(`In a real app, this action would update the user's 'custom:mfa' attribute to false.`);


    revalidatePath('/profile');
    revalidatePath('/'); // Also revalidate dashboard

    return { success: true, message: 'Authenticator app disabled successfully.' };
}
