'use server';
import 'server-only';
import { cache } from 'react';
import { EncryptJWT, jwtDecrypt } from 'jose';
import { cookies } from 'next/headers';
import { getCache, setCache, deleteCache } from './redis';
import { refreshAuthTokens } from './session-actions';

const secretKey = process.env.TOTP_SECRET_ENCRYPTION_KEY;
if (!secretKey) {
  throw new Error(
    'TOTP_SECRET_ENCRYPTION_KEY is not set in environment variables'
  );
}
const encodedKey = Buffer.from(secretKey, 'base64');
const cookieName = 'session';
const sessionPrefix = 'session:';

async function encrypt(payload: any) {
  return new EncryptJWT(payload)
    .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
    .setIssuedAt()
    .encrypt(encodedKey);
}

async function decrypt(session: string | undefined = ''): Promise<any> {
  if (!session) return null;
  try {
    const { payload } = await jwtDecrypt(session, encodedKey, {
      clockTolerance: '15s',
    });
    return payload;
  } catch (error) {
    return null;
  }
}

export async function createSession(
  sessionData: any,
  expiresInSeconds: number
) {
  const sessionId = crypto.randomUUID();
  const key = `${sessionPrefix}${sessionId}`;

  await setCache(key, sessionData, expiresInSeconds);

  const encryptedSessionId = await encrypt({ sessionId });

  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7-day cookie

  (await cookies()).set(cookieName, encryptedSessionId, {
    expires,
    httpOnly: true,
    secure: true,
    path: '/',
    sameSite: 'lax',
  });
}

export async function updateSession(
  sessionId: string,
  sessionData: any,
  expiresInSeconds: number
) {
  const key = `${sessionPrefix}${sessionId}`;
  await setCache(key, sessionData, expiresInSeconds);
}

export async function deleteSession() {
  const cookie = (await cookies()).get(cookieName)?.value;
  if (cookie) {
    try {
      const payload = await decrypt(cookie);
      if (payload?.sessionId) {
        await deleteCache(`${sessionPrefix}${payload.sessionId}`);
      }
    } catch (e) {
      console.error('Error deleting session from Redis:', e);
    }
  }
  (await cookies()).set(cookieName, '', { expires: new Date(0), path: '/' });
}

export const getSession = cache(async () => {
  const cookie = (await cookies()).get(cookieName)?.value;
  const payload = await decrypt(cookie);

  if (!payload?.sessionId) {
    return null;
  }

  const key = `${sessionPrefix}${payload.sessionId}`;
  const session = await getCache<any>(key);

  if (!session) {
    await deleteSession(); // Clean up invalid cookie
    return null;
  }

  // Check if the token is expired and refresh if necessary
  if (session.claims.exp * 1000 < Date.now()) {
    console.log('Session token expired, attempting refresh...');
    const refreshResult = await refreshAuthTokens(session.refreshToken);

    if (refreshResult) {
      const { newClaims, newAccessToken, newRefreshToken, newExpiresIn } =
        refreshResult;

      const newSessionData = {
        ...session,
        claims: newClaims,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };

      await updateSession(payload.sessionId, newSessionData, newExpiresIn);

      // Return the newly refreshed session
      return { ...newSessionData, sessionId: payload.sessionId };
    } else {
      // Refresh failed, delete the session
      console.log('Token refresh failed, deleting session.');
      await deleteSession();
      return null;
    }
  }

  return { ...session, sessionId: payload.sessionId };
});
