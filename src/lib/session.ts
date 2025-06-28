'use server';
import 'server-only';
import { cache } from 'react';
import { EncryptJWT, jwtDecrypt } from 'jose';
import { cookies } from 'next/headers';
import { kv } from '@vercel/kv';
import { refreshAuthTokens } from './session-actions';
import type {
  Session,
  SessionPayload,
  SessionCacheData,
} from '@/interfaces/lib/session.interfaces';
import { JWTPayload } from 'jose';

const secretKey = process.env.TOTP_SECRET_ENCRYPTION_KEY;
if (!secretKey) {
  throw new Error(
    'TOTP_SECRET_ENCRYPTION_KEY is not set in environment variables'
  );
}
const encodedKey = Buffer.from(secretKey, 'base64');
const cookieName = 'session';
const sessionPrefix = 'session:';

async function encrypt(payload: JWTPayload): Promise<string> {
  return new EncryptJWT(payload)
    .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
    .setIssuedAt()
    .encrypt(encodedKey);
}

async function decrypt(
  session: string | undefined = ''
): Promise<SessionPayload | null> {
  if (!session) return null;
  try {
    const { payload } = await jwtDecrypt(session, encodedKey, {
      clockTolerance: '15s',
    });
    return payload as SessionPayload;
  } catch (error) {
    return null;
  }
}

export async function createSession(
  sessionData: SessionCacheData,
  expiresInSeconds: number
): Promise<void> {
  const sessionId: string = crypto.randomUUID();
  const key: string = `${sessionPrefix}${sessionId}`;

  await kv.set(key, sessionData, { ex: expiresInSeconds });

  const encryptedSessionId = await encrypt({ sessionId });

  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7-day cookie

  cookies().set(cookieName, encryptedSessionId, {
    expires,
    httpOnly: true,
    secure: true,
    path: '/',
    sameSite: 'lax',
  });
}

export async function createMockSession(
  sessionData: SessionCacheData
): Promise<void> {
  const payload: SessionPayload = {
    ...sessionData,
    isMock: true,
  };

  const encryptedSession = await encrypt(payload);
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  cookies().set(cookieName, encryptedSession, {
    expires,
    httpOnly: true,
    secure: true,
    path: '/',
    sameSite: 'lax',
  });
}

export async function updateSession(
  sessionId: string,
  sessionData: SessionCacheData,
  expiresInSeconds: number
): Promise<void> {
  const key = `${sessionPrefix}${sessionId}`;
  await kv.set(key, sessionData, { ex: expiresInSeconds });
}

export async function deleteSession(): Promise<void> {
  const cookie = cookies().get(cookieName)?.value;
  if (cookie) {
    try {
      const payload = await decrypt(cookie);
      if (payload?.sessionId) {
        await kv.del(`${sessionPrefix}${payload.sessionId}`);
      }
    } catch (e) {
      console.error('Error deleting session from Vercel KV:', e);
    }
  }
  cookies().set(cookieName, '', { expires: new Date(0), path: '/' });
}

export const getSession = cache(async (): Promise<Session | null> => {
  const cookie = cookies().get(cookieName)?.value;
  const payload = await decrypt(cookie);

  if (!payload) {
    return null;
  }

  if (payload.isMock) {
    return payload as Session;
  }

  if (!payload.sessionId) {
    return null;
  }

  const key: string = `${sessionPrefix}${payload.sessionId}`;
  let session = await kv.get<SessionCacheData>(key);

  if (!session) {
    return null;
  }

  // Check if the token is expired and refresh if necessary
  if (session.claims.exp && session.claims.exp * 1000 < Date.now()) {
    console.log('Session token expired, attempting refresh...');
    const refreshResult = await refreshAuthTokens(session.refreshToken);

    if (refreshResult) {
      const { newClaims, newAccessToken, newRefreshToken, newExpiresIn } =
        refreshResult;

      const newSessionData: SessionCacheData = {
        ...session,
        claims: newClaims,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };

      await updateSession(payload.sessionId, newSessionData, newExpiresIn);
      session = newSessionData; // Update the session for the current request
    } else {
      console.log('Token refresh failed, deleting session from Vercel KV.');
      await kv.del(key);
      return null;
    }
  }

  return { ...session, sessionId: payload.sessionId };
});
