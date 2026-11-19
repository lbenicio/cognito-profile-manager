'use server';
import 'server-only';
import { cache } from 'react';
import { EncryptJWT, jwtDecrypt, type JWTPayload } from 'jose';
import { cookies } from 'next/headers';
import { getCache, setCache, delCache } from './cache';
import { refreshAuthTokens } from '@/actions/session.action';
import { Logger } from '@/lib/logger';
import type { AppSession } from '@/types/user/user.types';
import type { AuthTokenPayload } from '@/types/contracts/auth/auth.types';
import type {
  MockSessionData,
  OidcSessionData,
} from '@/types/session/oidc-session.types';

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

const SESSION_DURATION_SECONDS = 30 * 24 * 60 * 60;

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

export async function createSessionCookieValue(
  sessionData: OidcSessionData
): Promise<string> {
  const sessionId = crypto.randomUUID();
  const key = `${sessionPrefix}${sessionId}`;

  await setCache<OidcSessionData>(key, sessionData, SESSION_DURATION_SECONDS);

  const encryptedSessionId = await encrypt({ sessionId });

  return encryptedSessionId;
}

export async function createMockSession(
  sessionData: MockSessionData
): Promise<void> {
  const payload: JWTPayload = {
    ...sessionData,
    isMock: true,
  };

  const encryptedSession = await encrypt(payload);

  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

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
  sessionData: OidcSessionData
): Promise<void> {
  const key = `${sessionPrefix}${sessionId}`;
  await setCache(key, sessionData, SESSION_DURATION_SECONDS);
}

export async function deleteSession(): Promise<void> {
  const cookie = (await cookies()).get(cookieName)?.value;
  if (cookie) {
    try {
      const payload = await decrypt(cookie);
      if (payload?.sessionId && typeof payload.sessionId === 'string') {
        await delCache(`${sessionPrefix}${payload.sessionId}`);
      }
    } catch (e) {
      logger.error('Error deleting session from cache:', e);
    }
  }
  (await cookies()).set(cookieName, '', { expires: new Date(0), path: '/' });
}

export const getSession = cache(async (): Promise<AppSession | null> => {
  const cookie = (await cookies()).get(cookieName)?.value;
  if (!cookie) {
    return null;
  }
  const payload = await decrypt(cookie);

  if (!payload) {
    logger.warn(
      'Session cookie could not be decrypted or was empty in getSession.'
    );
    return null;
  }

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
        claims: payload.claims as AuthTokenPayload,
        username: payload.username,
        isMock: true,
        sessionId: 'mock-session',
      };
    }
    return null;
  }

  if (payload.sessionId && typeof payload.sessionId === 'string') {
    const key = `${sessionPrefix}${payload.sessionId}`;
    let sessionData = await getCache<OidcSessionData>(key);

    if (!sessionData) {
      logger.error(
        `Session data not found in cache for session ID: ${payload.sessionId}. The session may have expired from the cache or the cache is unreachable/misconfigured.`
      );
      return null;
    }

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

        const newSessionData: OidcSessionData = {
          claims: newClaims,
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        };

        await updateSession(payload.sessionId, newSessionData);
        sessionData = newSessionData;
      } else {
        logger.warn(
          'Token refresh failed. Deleting session from cache and browser.'
        );
        await delCache(key);
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
