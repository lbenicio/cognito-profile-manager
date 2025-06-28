/**
 * Session types for authentication and session management.
 * Contains only type aliases, unions, and enums. All interfaces are in @/interfaces/session/
 */

/**
 * Session invalidation reasons
 */
export type SessionInvalidReason =
  | 'NOT_FOUND'
  | 'EXPIRED'
  | 'INVALID_TOKEN'
  | 'TOKEN_EXPIRED'
  | 'USER_DISABLED'
  | 'SECURITY_VIOLATION'
  | 'MANUAL_LOGOUT'
  | 'CONCURRENT_LOGIN'
  | 'SUSPICIOUS_ACTIVITY';

/**
 * Session actions for activity logging
 */
export type SessionAction =
  | 'SESSION_CREATED'
  | 'SESSION_REFRESHED'
  | 'SESSION_EXPIRED'
  | 'SESSION_INVALIDATED'
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'LOGOUT'
  | 'TOKEN_REFRESH'
  | 'SECURITY_CHECK'
  | 'SUSPICIOUS_ACTIVITY';

/**
 * Session storage types
 */
export type SessionStorageType = 'memory' | 'redis' | 'database' | 'file';

/**
 * Token types
 */
export type TokenType = 'access' | 'refresh' | 'id' | 'session';

/**
 * Session events
 */
export type SessionEvent =
  | 'session:created'
  | 'session:updated'
  | 'session:expired'
  | 'session:invalidated'
  | 'session:refreshed'
  | 'session:activity';

/**
 * Session status types
 */
export type SessionStatus = 'active' | 'expired' | 'revoked' | 'suspended';

/**
 * Cookie SameSite attribute values
 */
export type SameSiteAttribute = 'strict' | 'lax' | 'none';

/**
 * Session lifecycle states
 */
export type SessionLifecycleState =
  | 'created'
  | 'active'
  | 'idle'
  | 'refreshing'
  | 'expiring'
  | 'expired'
  | 'destroyed';

/**
 * Session security level
 */
export type SessionSecurityLevel = 'basic' | 'elevated' | 'high' | 'maximum';

/**
 * Logout types
 */
export type LogoutType = 'local' | 'global' | 'forced' | 'expired';

/**
 * Session environment
 */
export type SessionEnvironment = 'browser' | 'mobile' | 'api' | 'service';

/**
 * Default session configuration
 */
export const DEFAULT_SESSION_CONFIG = {
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  cookieName: 'session',
  secure: process.env.NODE_ENV === 'production',
  httpOnly: true,
  sameSite: 'lax' as const,
  path: '/',
  rolling: true,
  renewThreshold: 15 * 60 * 1000, // 15 minutes
};

/**
 * Re-export interfaces for convenience
 */
export type {
  BaseSession,
  SessionClaims,
  AuthSession,
  SessionFingerprint,
  CreateSessionParams,
  UpdateSessionParams,
  SessionStorage,
  SessionCookieConfig,
  SessionValidation,
  SessionSecurityPolicy,
  SessionActivity,
  MockSessionConfig,
  SessionManager,
  TokenRefreshConfig,
  SessionConfig,
  SessionContext,
  SessionMetrics,
} from '@/interfaces/session/session.interfaces';
