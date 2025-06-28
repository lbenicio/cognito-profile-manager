/**
 * Session interfaces for authentication and session management.
 */

import type { JWTPayload } from 'jose';

/**
 * Base session interface
 */
export interface BaseSession {
  sessionId: string;
  createdAt: number;
  updatedAt: number;
  expiresAt: number;
  isValid: boolean;
}

/**
 * JWT claims interface extending standard JWT payload
 */
export interface SessionClaims extends JWTPayload {
  sub: string;
  email: string;
  email_verified: boolean;
  username: string;
  name: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  locale?: string;
  zoneinfo?: string;
  groups?: string[];
  'custom:isAdmin'?: string;
  'custom:twoFactorEnabled'?: string;
  'custom:passkeysEnabled'?: string;
  token_use: 'access' | 'id';
  client_id: string;
  aud: string;
  iss: string;
  iat: number;
  exp: number;
  auth_time?: number;
}

/**
 * Authentication session
 */
export interface AuthSession extends BaseSession {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  tokenType: 'Bearer';
  claims: SessionClaims;
  username: string;
  userId: string;
  email: string;
  isAdmin: boolean;
  groups: string[];
  lastActivity: number;
  fingerprint?: SessionFingerprint;
  isMock?: boolean;
}

/**
 * Session fingerprint for security tracking
 */
export interface SessionFingerprint {
  userAgent: string;
  ipAddress: string;
  country?: string;
  city?: string;
  device?: string;
  browser?: string;
  os?: string;
  screenResolution?: string;
  timezone?: string;
  language?: string;
}

/**
 * Session creation parameters
 */
export interface CreateSessionParams {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  claims: SessionClaims;
  fingerprint?: Partial<SessionFingerprint>;
  maxAge?: number;
  isMock?: boolean;
}

/**
 * Session update parameters
 */
export interface UpdateSessionParams {
  sessionId: string;
  accessToken?: string;
  refreshToken?: string;
  idToken?: string;
  claims?: Partial<SessionClaims>;
  expiresAt?: number;
  lastActivity?: number;
}

/**
 * Session storage interface
 */
export interface SessionStorage {
  create(params: CreateSessionParams): Promise<AuthSession>;
  get(sessionId: string): Promise<AuthSession | null>;
  update(params: UpdateSessionParams): Promise<AuthSession | null>;
  delete(sessionId: string): Promise<boolean>;
  cleanup(): Promise<number>;
  list(userId: string): Promise<AuthSession[]>;
  invalidateAll(userId: string): Promise<number>;
}

/**
 * Session cookie configuration
 */
export interface SessionCookieConfig {
  name: string;
  maxAge: number;
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'strict' | 'lax' | 'none';
  domain?: string;
  path: string;
}

/**
 * Session validation result
 */
export interface SessionValidation {
  isValid: boolean;
  session?: AuthSession;
  reason?: import('@/types/session.types').SessionInvalidReason;
  needsRefresh?: boolean;
}

/**
 * Session security policy
 */
export interface SessionSecurityPolicy {
  maxConcurrentSessions: number;
  idleTimeout: number;
  absoluteTimeout: number;
  requireReauthentication: boolean;
  checkFingerprint: boolean;
  allowMultipleDevices: boolean;
  enforceIpValidation: boolean;
}

/**
 * Session activity log entry
 */
export interface SessionActivity {
  sessionId: string;
  userId: string;
  action: import('@/types/session.types').SessionAction;
  timestamp: number;
  ipAddress: string;
  userAgent: string;
  location?: {
    country?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
  };
  details?: Record<string, unknown>;
}

/**
 * Mock session configuration for development
 */
export interface MockSessionConfig {
  enabled: boolean;
  defaultUser: {
    sub: string;
    username: string;
    email: string;
    name: string;
    isAdmin: boolean;
    groups: string[];
  };
  expiresIn: number;
}

/**
 * Session manager interface
 */
export interface SessionManager {
  create(params: CreateSessionParams): Promise<AuthSession>;
  get(sessionId: string): Promise<AuthSession | null>;
  validate(sessionId: string): Promise<SessionValidation>;
  refresh(sessionId: string): Promise<AuthSession | null>;
  invalidate(sessionId: string): Promise<boolean>;
  invalidateAll(userId: string): Promise<number>;
  cleanup(): Promise<number>;
  logActivity(activity: Omit<SessionActivity, 'timestamp'>): Promise<void>;
  getActiveSessions(userId: string): Promise<AuthSession[]>;
}

/**
 * Token refresh configuration
 */
export interface TokenRefreshConfig {
  refreshThreshold: number; // Seconds before expiry to refresh
  maxRetries: number;
  backoffMultiplier: number;
  autoRefresh: boolean;
}

/**
 * Session configuration
 */
export interface SessionConfig {
  cookieName: string;
  maxAge: number;
  refreshThreshold: number;
  storage: 'memory' | 'redis' | 'database';
  security: SessionSecurityPolicy;
  cookie: SessionCookieConfig;
  mock?: MockSessionConfig;
}

/**
 * Session context for React components
 */
export interface SessionContext {
  session: AuthSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  user: {
    id: string;
    email: string;
    name: string;
    username: string;
    isAdmin: boolean;
    groups: string[];
  } | null;
  login: (credentials: import('@/interfaces/auth/auth.interfaces').LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

/**
 * Session metrics for monitoring
 */
export interface SessionMetrics {
  totalSessions: number;
  activeSessions: number;
  expiredSessions: number;
  averageSessionDuration: number;
  loginSuccessRate: number;
  concurrentUsers: number;
  topCountries: Array<{ country: string; count: number }>;
  deviceBreakdown: Array<{ device: string; count: number }>;
}
