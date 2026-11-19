/**
 * Authentication types for the application.
 * Contains only type aliases, unions, and enums. All interfaces are in @/types/contracts/auth/
 */

/**
 * Authentication state
 */
export type AuthState =
  'authenticated' | 'unauthenticated' | 'loading' | 'error';

/**
 * Authentication method
 */
export type AuthMethod = 'sso' | 'passkey' | 'mfa' | 'password' | 'mock';

/**
 * Authentication event types
 */
export type AuthEvent =
  | 'login_attempt'
  | 'login_success'
  | 'login_failed'
  | 'logout'
  | 'token_refresh'
  | 'session_expired'
  | 'mfa_required'
  | 'mfa_success'
  | 'mfa_failed'
  | 'password_change_required'
  | 'account_locked'
  | 'suspicious_activity';

/**
 * Authentication flow types
 */
export type AuthFlow =
  | 'signin'
  | 'signup'
  | 'forgot_password'
  | 'reset_password'
  | 'verify_email'
  | 'mfa_setup'
  | 'mfa_verify';

/**
 * OAuth provider types
 */
export type OAuthProvider =
  'cognito' | 'google' | 'facebook' | 'apple' | 'github';

/**
 * Token types
 */
export type TokenType = 'access' | 'refresh' | 'id' | 'session';

/**
 * Permission action types
 */
export type PermissionAction =
  'create' | 'read' | 'update' | 'delete' | 'list' | 'manage' | 'admin';

/**
 * Permission resource types
 */
export type PermissionResource =
  'user' | 'profile' | 'settings' | 'admin' | 'system' | 'audit' | 'logs';

/**
 * User role types
 */
export type UserRole = 'user' | 'admin' | 'moderator' | 'viewer';

/**
 * Account status types
 */
export type AccountStatus =
  | 'active'
  | 'inactive'
  | 'suspended'
  | 'pending_verification'
  | 'locked'
  | 'archived';

/**
 * MFA method types
 */
export type MfaMethod = 'sms' | 'email' | 'totp' | 'webauthn' | 'backup_codes';

/**
 * Login result types
 */
export type LoginResult =
  'success' | 'failure' | 'mfa_required' | 'password_reset_required';

/**
 * Logout reason types
 */
export type LogoutReason =
  'user_action' | 'session_expired' | 'admin_action' | 'security_violation';

/**
 * Device type for authentication
 */
export type DeviceType = 'desktop' | 'mobile' | 'tablet' | 'unknown';

/**
 * Browser type
 */
export type BrowserType =
  'chrome' | 'firefox' | 'safari' | 'edge' | 'opera' | 'unknown';

/**
 * Operating system type
 */
export type OperatingSystem =
  'windows' | 'macos' | 'linux' | 'ios' | 'android' | 'unknown';

/**
 * Risk level types
 */
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

/**
 * Verification status types
 */
export type VerificationStatus = 'pending' | 'verified' | 'failed' | 'expired';

/**
 * Challenge type for authentication
 */
export type ChallengeType =
  | 'password'
  | 'mfa_sms'
  | 'mfa_totp'
  | 'mfa_webauthn'
  | 'security_questions'
  | 'captcha';

/**
 * Session status types
 */
export type SessionStatus = 'active' | 'expired' | 'revoked' | 'suspended';

/**
 * Default authentication configuration
 */
export const DEFAULT_AUTH_CONFIG = {
  sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
  refreshTokenTimeout: 7 * 24 * 60 * 60 * 1000, // 7 days
  maxLoginAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15 minutes
  passwordMinLength: 8,
  requireMfa: false,
  allowRememberMe: true,
  tokenRefreshThreshold: 5 * 60 * 1000, // 5 minutes
  securityLevel: 'basic' as const,
};

/**
 * Re-export interfaces for convenience
 */
export type {
  LoginCredentials,
  AuthResult,
  AuthUser,
  AuthContext,
  Permission,
  Role,
  AuthConfig,
  PasswordPolicy,
  SecuritySettings,
  LoginAttempt,
  AuthDevice,
  AuthEventData,
  AuthAuditLog,
  TokenValidation,
  AuthTokenPayload,
  OAuthCallbackParams,
  OAuthTokenResponse,
  AuthProviderConfig,
  AuthorizationContext,
  SsoLoginParams,
  PasskeyAuthParams,
  MfaVerificationParams,
} from '@/types/contracts/auth/auth.types';
