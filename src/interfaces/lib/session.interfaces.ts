import type { JWTPayload } from 'jose';

/**
 * The payload encrypted into the session cookie.
 */
export interface SessionPayload extends JWTPayload {
  sessionId?: string;
  isMock?: boolean;
  username?: string;
  claims?: JWTPayload;
}

/**
 * The data stored in the cache (Redis/KV) for a session.
 */
export interface SessionCacheData {
  accessToken: string;
  refreshToken: string;
  claims: JWTPayload;
  isMock?: boolean;
  username?: string;
}

/**
 * The fully hydrated session object available to Server Components.
 */
export interface Session extends SessionCacheData {
  sessionId: string;
}
