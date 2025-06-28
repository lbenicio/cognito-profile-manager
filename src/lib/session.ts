'use server';

import 'server-only';
import { cache } from 'react';
import { EncryptJWT, jwtDecrypt } from 'jose';
import { cookies } from 'next/headers';

const secretKey = process.env.TOTP_SECRET_ENCRYPTION_KEY;
if (!secretKey) {
  throw new Error('TOTP_SECRET_ENCRYPTION_KEY is not set in environment variables');
}
// Correctly decode the Base64 key to get the raw bytes for encryption.
const encodedKey = Buffer.from(secretKey, 'base64');
const cookieName = 'session';

export async function encrypt(payload: any) {
  return new EncryptJWT(payload)
    .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
    .setIssuedAt()
    .encrypt(encodedKey);
}

export async function decrypt(session: string | undefined = ''): Promise<any> {
  if (!session) return null;
  try {
    const { payload } = await jwtDecrypt(session, encodedKey, {
      clockTolerance: '15s',
    });
    return payload;
  } catch (error) {
    // Session is invalid or expired
    return null;
  }
}

export async function createSession(sessionData: any, expiresInSeconds: number) {
  // The cookie expiration should be long-lived, matching the refresh token's potential lifespan.
  // The actual session validity is determined by the `exp` claim inside the encrypted payload.
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7-day cookie
  const sessionPayload = { ...sessionData, iat: Date.now() / 1000, exp: (Date.now() / 1000) + expiresInSeconds };
  
  const session = await encrypt(sessionPayload);

  cookies().set(cookieName, session, {
    expires,
    httpOnly: true,
    secure: true,
    path: '/',
    sameSite: 'lax',
  });
}

export async function deleteSession() {
  cookies().set(cookieName, '', { expires: new Date(0), path: '/' });
}

export const getSession = cache(async () => {
  const cookie = cookies().get(cookieName)?.value;
  const session = await decrypt(cookie);

  if (!session) {
    return null;
  }

  // Check if the access token inside the session is expired
  if (session.exp * 1000 < Date.now()) {
    // The middleware should handle refreshing, but as a fallback, we can treat it as expired.
    // We will rely on the middleware to perform the refresh.
  }

  return session;
});
