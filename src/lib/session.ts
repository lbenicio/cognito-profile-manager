'use server';
import 'server-only';
import { cache } from 'react';
import { EncryptJWT, jwtDecrypt, type JWTPayload } from 'jose';
import { cookies } from 'next/headers';
import { getCache, setCache, deleteCache } from './redis';
import { refreshAuthTokens } from './session-actions';
import type { Session } from '@/types/user/user.types';
import { Logger } from '@/lib/logger';

const logger = new Logger('SESSION');

const secretKey = process.env.TOTP_SECRET_ENCRYPTION_KEY;
if (!secretKey) {
  throw new Error(
    'TOTP_SECRET_ENCRYPTION_KEY is not set in environment variables'
  );
}
const encodedKey = Buffer.from(secretKey, 'base64');
const cookieName = 'session';
const sessionPrefix = 'session:';

// Define a long-lived session duration (30 days in seconds)
const SESSION_DURATION_SECONDS = 30 * 24 * 60 * 60;

// Interfaces for session data shapes
interface OIDC_SessionData {
  claims: JWTPayload;
  accessToken: string;
  refreshToken: string;
}

interface Mock_SessionData extends OIDC_SessionData {
  username: string;
}

async function encrypt(payload: JWTPayload): Promise<string> {
  return new EncryptJWT(payload)
    .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
    .setIssuedAt()
    .encrypt(encodedKey);
}

async function decrypt(
  session: string | undefined = ''
): Promise<JWTPayload | null> {
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
  sessionData: OIDC_SessionData
): Promise<void> {
  const sessionId = crypto.randomUUID();
  const key = `${sessionPrefix}${sessionId}`;

  // Store session in Redis with a 30-day TTL
  await setCache<OIDC_SessionData>(key, sessionData, SESSION_DURATION_SECONDS);

  const encryptedSessionId = await encrypt({ sessionId });

  // Set the browser cookie to also expire in 30 days
  const expires = new Date(Date.now() + SESSION_DURATION_SECONDS * 1000);

  (await cookies()).set(cookieName, encryptedSessionId, {
    expires,
    httpOnly: true,
    secure: true,
    path: '/',
    sameSite: 'lax',
  });
}

export async function createMockSession(
  sessionData: Mock_SessionData
): Promise<void> {
  const payload: JWTPayload = {
    ...sessionData,
    isMock: true,
  };

  const encryptedSession = await encrypt(payload);

  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7-day cookie

  (await cookies()).set(cookieName, encryptedSession, {
    expires,
    httpOnly: true,
    secure: true,
    path: '/',
    sameSite: 'lax',
  });
}

export async function updateSession(
  sessionId: string,
  sessionData: OIDC_SessionData
): Promise<void> {
  const key = `${sessionPrefix}${sessionId}`;
  // When updating, reset the TTL to the full 30-day duration
  await setCache(key, sessionData, SESSION_DURATION_SECONDS);
}

export async function deleteSession(): Promise<void> {
  const cookie = (await cookies()).get(cookieName)?.value;
  if (cookie) {
    try {
      const payload = await decrypt(cookie);
      if (payload?.sessionId && typeof payload.sessionId === 'string') {
        await deleteCache(`${sessionPrefix}${payload.sessionId}`);
      }
    } catch (e) {
      logger.error('Error deleting session from Redis:', e);
    }
  }
  (await cookies()).set(cookieName, '', { expires: new Date(0), path: '/' });
}

export const getSession = cache(async (): Promise<Session | null> => {
  const cookie = (await cookies()).get(cookieName)?.value;
  const payload = await decrypt(cookie);

  if (!payload) {
    return null;
  }

  // Handle mock session for dev
  if (payload.isMock === true) {
    if (
      typeof payload.username === 'string' &&
      typeof payload.accessToken === 'string' &&
      typeof payload.refreshToken === 'string' &&
      typeof payload.claims === 'object' &&
      payload.claims !== null
    ) {
      return {
        accessToken: payload.accessToken,
        refreshToken: payload.refreshToken,
        claims: payload.claims as JWTPayload,
        username: payload.username,
        isMock: true,
        sessionId: 'mock-session',
      };
    }
    return null; // Invalid mock session payload
  }

  // Handle real session
  if (payload.sessionId && typeof payload.sessionId === 'string') {
    const key = `${sessionPrefix}${payload.sessionId}`;
    let sessionData = await getCache<OIDC_SessionData>(key);

    if (!sessionData) {
      return null;
    }

    // Check if the access token is expired or close to expiring.
    // Refresh 5 minutes before actual expiry to be safe.
    const isTokenExpired = sessionData.claims.exp
      ? sessionData.claims.exp * 1000 < Date.now() + 5 * 60 * 1000
      : true;

    if (isTokenExpired) {
      logger.info(
        'Access token expired or nearing expiry, attempting refresh...'
      );
      const refreshResult = await refreshAuthTokens(sessionData.refreshToken);

      if (refreshResult) {
        const { newClaims, newAccessToken, newRefreshToken } = refreshResult;

        const newSessionData: OIDC_SessionData = {
          claims: newClaims,
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        };

        // The updateSession function will reset the Redis TTL to the full duration
        await updateSession(payload.sessionId, newSessionData);
        sessionData = newSessionData; // Update the session for the current request
      } else {
        logger.warn(
          'Token refresh failed. Deleting session from Redis and browser.'
        );
        await deleteCache(key);
        // Important: clear the invalid cookie to prevent redirect loops
        (await cookies()).set(cookieName, '', {
          expires: new Date(0),
          path: '/',
        });
        return null;
      }
    }

    return {
      ...sessionData,
      isMock: false,
      sessionId: payload.sessionId,
    };
  }

  return null;
});
