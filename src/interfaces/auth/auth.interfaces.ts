/**
 * Authentication interfaces for the application.
 */

/**
 * Login credentials for different authentication methods
 */
export interface LoginCredentials {
  username?: string;
  email?: string;
  password?: string;
  mfaCode?: string;
  rememberMe?: boolean;
}

/**
 * SSO login parameters
 */
export interface SsoLoginParams {
  provider: 'cognito' | 'oidc';
  redirectUri?: string;
  state?: string;
  scope?: string;
}

/**
 * Passkey authentication parameters
 */
export interface PasskeyAuthParams {
  challenge: string;
  allowCredentials?: PublicKeyCredentialDescriptor[];
  userVerification?: UserVerificationRequirement;
  timeout?: number;
}

/**
 * MFA verification parameters
 */
export interface MfaVerificationParams {
  code: string;
  secretCode?: string;
  friendlyDeviceName?: string;
}

/**
 * Authentication result
 */
export interface AuthResult {
  success: boolean;
  user?: {
    id: string;
    username: string;
    email: string;
    name: string;
    isAdmin: boolean;
  };
  session?: {
    sessionId: string;
    accessToken: string;
    refreshToken?: string;
    expiresAt: number;
  };
  error?: string;
  requiresMfa?: boolean;
  requiresPasswordChange?: boolean;
}

/**
 * Token validation result
 */
export interface TokenValidation {
  isValid: boolean;
  claims?: import('jose').JWTPayload;
  error?: string;
  needsRefresh?: boolean;
}

/**
 * JWT token payload structure
 */
import { JWTPayload } from 'jose';

export interface AuthTokenPayload extends JWTPayload {
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
 * OAuth/OIDC callback parameters
 */
export interface OAuthCallbackParams {
  code?: string;
  state?: string;
  error?: string;
  error_description?: string;
  session_state?: string;
}

/**
 * OAuth token response
 */
export interface OAuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  id_token?: string;
  scope?: string;
}

/**
 * Authentication provider configuration
 */
export interface AuthProviderConfig {
  cognito: {
    clientId: string;
    userPoolId?: string;
    identityPoolId?: string;
    region: string;
    wellknownUrl: string;
  };
  oauth: {
    authorizeUrl: string;
    tokenUrl: string;
    userInfoUrl: string;
    logoutUrl: string;
    scope: string;
    responseType: string;
  };
  session: {
    cookieName: string;
    maxAge: number;
    secure: boolean;
    httpOnly: boolean;
    sameSite: 'strict' | 'lax' | 'none';
  };
}

/**
 * Authentication context for React components
 */
export interface AuthContext {
  state: import('@/types/auth.types').AuthState;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<AuthResult>;
  loginWithSso: (params?: SsoLoginParams) => Promise<void>;
  loginWithPasskey: (params: PasskeyAuthParams) => Promise<AuthResult>;
  verifyMfa: (params: MfaVerificationParams) => Promise<AuthResult>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  clearError: () => void;
}

/**
 * Authenticated user information
 */
export interface AuthUser {
  id: string;
  username: string;
  email: string;
  emailVerified: boolean;
  name: string;
  givenName?: string;
  familyName?: string;
  picture?: string;
  locale?: string;
  timezone?: string;
  groups: string[];
  isAdmin: boolean;
  twoFactorEnabled: boolean;
  passkeysEnabled: boolean;
  lastLogin?: string;
  createdAt: string;
}

/**
 * Authentication event data
 */
export interface AuthEventData {
  event: import('@/types/auth.types').AuthEvent;
  userId?: string;
  username?: string;
  email?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: number;
  method: import('@/types/auth.types').AuthMethod;
  success: boolean;
  error?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Permission and role definitions
 */
export interface Permission {
  id: string;
  name: string;
  description?: string;
  resource: string;
  action: string;
}

/**
 * Role definition
 */
export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
  isDefault?: boolean;
}

/**
 * Authorization context
 */
export interface AuthorizationContext {
  user: AuthUser;
  permissions: Permission[];
  roles: Role[];
  hasPermission: (resource: string, action: string) => boolean;
  hasRole: (roleName: string) => boolean;
  isAdmin: boolean;
}

/**
 * Password policy configuration
 */
export interface PasswordPolicy {
  minLength: number;
  maxLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  forbiddenPasswords?: string[];
  expirationDays?: number;
  historyCount?: number;
}

/**
 * Account security settings
 */
export interface SecuritySettings {
  twoFactorEnabled: boolean;
  passkeysEnabled: boolean;
  loginNotifications: boolean;
  suspiciousActivityAlerts: boolean;
  sessionTimeout: number;
  maxConcurrentSessions: number;
  trustedDevices: string[];
}

/**
 * Login attempt tracking
 */
export interface LoginAttempt {
  id: string;
  userId?: string;
  username?: string;
  email?: string;
  ipAddress: string;
  userAgent: string;
  method: import('@/types/auth.types').AuthMethod;
  success: boolean;
  timestamp: number;
  error?: string;
  location?: {
    country?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
  };
}

/**
 * Authentication audit log entry
 */
export interface AuthAuditLog {
  id: string;
  userId?: string;
  event: import('@/types/auth.types').AuthEvent;
  details: AuthEventData;
  risk_score?: number;
  action_taken?: string;
  created_at: number;
}

/**
 * Device information for authentication
 */
export interface AuthDevice {
  id: string;
  name: string;
  type: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  browser?: string;
  os?: string;
  fingerprint: string;
  isTrusted: boolean;
  lastUsed: number;
  createdAt: number;
}

/**
 * Authentication configuration
 */
export interface AuthConfig {
  providers: AuthProviderConfig;
  security: {
    passwordPolicy: PasswordPolicy;
    sessionTimeout: number;
    maxLoginAttempts: number;
    lockoutDuration: number;
    requireEmailVerification: boolean;
    enableMfa: boolean;
    enablePasskeys: boolean;
  };
  features: {
    enableSsoLogin: boolean;
    enableDevLogin: boolean;
    enableMockAuth: boolean;
    enableAuditLogging: boolean;
  };
}
