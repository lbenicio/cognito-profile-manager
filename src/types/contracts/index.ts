/**
 * Main interfaces index file - exports all interface definitions for the application.
 * This file exports all interfaces organized by domain/module.
 */

// ============================================================================
// AUTHENTICATION INTERFACES
// ============================================================================

export * from './auth/auth.types';

// ============================================================================
// SESSION INTERFACES
// ============================================================================

export * from './session/session.types';

// ============================================================================
// API INTERFACES
// ============================================================================

export * from './api/response.types';

// ============================================================================
// ERROR INTERFACES
// ============================================================================

export * from './error/error.types';

// ============================================================================
// ACTION INTERFACES
// ============================================================================

export * from './actions/action.types';

// ============================================================================
// COMMONLY USED INTERFACES (for convenience)
// ============================================================================

// Auth interfaces
export type {
  LoginCredentials,
  AuthResult,
  AuthUser,
  AuthContext,
  Permission,
  Role,
  PasswordPolicy,
  SecuritySettings,
} from './auth/auth.types';

// Session interfaces
export type {
  AuthSession,
  SessionClaims,
  SessionFingerprint,
  SessionManager,
  SessionValidation,
  SessionConfig,
} from './session/session.types';

// API interfaces
export type {
  BaseApiResponse,
  ApiResponse,
  ApiErrorResponse,
  ApiSuccessResponse,
  PaginationMeta,
  PaginatedApiResponse,
} from './api/response.types';

// Error interfaces
export type {
  AppError,
  AuthError,
  ValidationError,
  ApiError,
  CognitoError,
  UploadError,
} from './error/error.types';

// Action interfaces
export type {
  BaseActionResult,
  ActionResult,
  ActionErrorResult,
  ActionSuccessResult,
  FormActionResult,
  LoginActionResult,
  ProfileUpdateResult,
  PasswordChangeResult,
  UploadActionResult,
  ValidationResult,
} from './actions/action.types';
