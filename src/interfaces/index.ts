/**
 * Main interfaces index file - exports all interface definitions for the application.
 * This file exports all interfaces organized by domain/module.
 */

// ============================================================================
// AUTHENTICATION INTERFACES
// ============================================================================

export * from './auth/auth.interfaces';

// ============================================================================
// SESSION INTERFACES
// ============================================================================

export * from './session/session.interfaces';

// ============================================================================
// API INTERFACES
// ============================================================================

export * from './api/response.interfaces';

// ============================================================================
// ERROR INTERFACES
// ============================================================================

export * from './error/error.interfaces';

// ============================================================================
// ACTION INTERFACES
// ============================================================================

export * from './actions/action.interfaces';

// ============================================================================
// COMPONENT INTERFACES
// ============================================================================

export * from './components/account-display.interfaces';
export * from './components/avatar-editor.interfaces';
export * from './components/banner-editor.interfaces';
export * from './components/contact-form.interfaces';
export * from './components/profile-display.interfaces';

// ============================================================================
// FORM INTERFACES
// ============================================================================

export * from './forms/account-form.interfaces';
export * from './forms/address-form.interfaces';
export * from './forms/password-form.interfaces';
export * from './forms/profile-form.interfaces';

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
} from './auth/auth.interfaces';

// Session interfaces
export type {
  AuthSession,
  SessionClaims,
  SessionFingerprint,
  SessionManager,
  SessionValidation,
  SessionConfig,
} from './session/session.interfaces';

// API interfaces
export type {
  BaseApiResponse,
  ApiResponse,
  ApiErrorResponse,
  ApiSuccessResponse,
  PaginationMeta,
  PaginatedApiResponse,
} from './api/response.interfaces';

// Error interfaces
export type {
  AppError,
  AuthError,
  ValidationError,
  ApiError,
  CognitoError,
  UploadError,
} from './error/error.interfaces';

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
} from './actions/action.interfaces';

// Component interfaces
export type { AccountDisplayProps } from './components/account-display.interfaces';
export type { AvatarEditorProps } from './components/avatar-editor.interfaces';
export type { BannerEditorProps } from './components/banner-editor.interfaces';
export type { ContactFormProps } from './components/contact-form.interfaces';
export type { ProfileDisplayProps } from './components/profile-display.interfaces';

// Form interfaces
export type {
  AccountFormProps,
  AccountFormValues,
} from './forms/account-form.interfaces';
export type {
  AddressFormProps,
  AddressFormValues,
} from './forms/address-form.interfaces';
export type { PasswordFormValues } from './forms/password-form.interfaces';
export type {
  ProfileFormProps,
  ProfileFormValues,
} from './forms/profile-form.interfaces';
