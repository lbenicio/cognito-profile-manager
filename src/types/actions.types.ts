/**
 * Action result types for all server actions in the application.
 * Provides standardized response types for form actions and server functions.
 */

/**
 * Base action result interface
 */
export interface BaseActionResult {
  success: boolean;
  message: string;
  timestamp?: number;
}

/**
 * Action result with data payload
 */
export interface ActionResult<T = unknown> extends BaseActionResult {
  data?: T;
}

/**
 * Action error result
 */
export interface ActionErrorResult extends BaseActionResult {
  success: false;
  error?: string;
  code?: string;
  field?: string;
  details?: Record<string, unknown>;
}

/**
 * Action success result
 */
export interface ActionSuccessResult<T = unknown> extends BaseActionResult {
  success: true;
  data?: T;
}

/**
 * Form action result with validation errors
 */
export interface FormActionResult<T = unknown> extends ActionResult<T> {
  fieldErrors?: Record<string, string[]>;
  formError?: string;
}

/**
 * Authentication action results
 */
export interface LoginActionResult extends BaseActionResult {
  user?: {
    id: string;
    username: string;
    email: string;
    name: string;
    isAdmin: boolean;
  };
  requiresMfa?: boolean;
  requiresPasswordChange?: boolean;
  redirectTo?: string;
}

export interface LogoutActionResult extends BaseActionResult {
  redirectTo?: string;
}

export interface MfaVerificationResult extends BaseActionResult {
  verified: boolean;
  backupCodes?: string[];
}

/**
 * Profile action results
 */
export interface ProfileUpdateResult extends BaseActionResult {
  updatedFields?: string[];
}

export interface AvatarUpdateResult extends BaseActionResult {
  avatarUrl?: string;
  uploadUrl?: string;
}

export interface BannerUpdateResult extends BaseActionResult {
  bannerUrl?: string;
  uploadUrl?: string;
}

/**
 * Security action results
 */
export interface PasswordChangeResult extends BaseActionResult {
  requiresLogin?: boolean;
}

export interface PasskeyActionResult extends BaseActionResult {
  credentialId?: string;
  credentialName?: string;
  publicKey?: string;
}

export interface DeviceActionResult extends BaseActionResult {
  deviceKey?: string;
  deviceName?: string;
}

/**
 * Settings action results
 */
export interface PreferencesUpdateResult extends BaseActionResult {
  preferences?: {
    theme?: string;
    language?: string;
    fontSize?: number;
  };
}

export interface NotificationSettingsResult extends BaseActionResult {
  settings?: {
    email?: boolean;
    app?: boolean;
    telegram?: boolean;
  };
}

export interface PrivacySettingsResult extends BaseActionResult {
  isPublic?: boolean;
  publicFields?: string[];
}

/**
 * Upload action results
 */
export interface UploadActionResult extends BaseActionResult {
  uploadUrl?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  contentType?: string;
}

/**
 * Contact action results
 */
export interface ContactFormResult extends BaseActionResult {
  ticketId?: string;
  estimatedResponse?: string;
}

/**
 * Admin action results
 */
export interface UserManagementResult extends BaseActionResult {
  userId?: string;
  action?: 'create' | 'update' | 'delete' | 'disable' | 'enable';
}

export interface GroupManagementResult extends BaseActionResult {
  groupId?: string;
  groupName?: string;
  members?: string[];
}

/**
 * Session action results
 */
export interface SessionActionResult extends BaseActionResult {
  sessionId?: string;
  expiresAt?: number;
  isValid?: boolean;
}

/**
 * Validation action results
 */
export interface ValidationResult extends BaseActionResult {
  isValid: boolean;
  errors?: string[];
  warnings?: string[];
}

export interface EmailVerificationResult extends BaseActionResult {
  verified: boolean;
  nextStep?: string;
}

export interface PhoneVerificationResult extends BaseActionResult {
  verified: boolean;
  nextStep?: string;
}

/**
 * Bulk action results
 */
export interface BulkActionResult<T = unknown> extends BaseActionResult {
  total: number;
  processed: number;
  successful: number;
  failed: number;
  errors?: Array<{
    index: number;
    error: string;
    item?: T;
  }>;
  results?: T[];
}

/**
 * Search and filter action results
 */
export interface SearchActionResult<T = unknown> extends ActionResult<T[]> {
  query: string;
  totalResults: number;
  page: number;
  pageSize: number;
  totalPages: number;
  filters?: Record<string, unknown>;
  facets?: Record<string, number>;
}

/**
 * Export action results
 */
export interface ExportActionResult extends BaseActionResult {
  downloadUrl?: string;
  format?: 'csv' | 'json' | 'pdf' | 'xlsx';
  fileName?: string;
  expiresAt?: number;
  recordCount?: number;
}

/**
 * Import action results
 */
export interface ImportActionResult extends BaseActionResult {
  importId?: string;
  totalRecords: number;
  processedRecords: number;
  successfulRecords: number;
  failedRecords: number;
  errors?: Array<{
    row: number;
    field?: string;
    error: string;
  }>;
  warnings?: Array<{
    row: number;
    field?: string;
    warning: string;
  }>;
}

/**
 * Audit action results
 */
export interface AuditActionResult extends BaseActionResult {
  auditId?: string;
  resource: string;
  action: string;
  userId?: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

/**
 * Health check action results
 */
export interface HealthCheckResult extends BaseActionResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: Array<{
    name: string;
    status: 'pass' | 'fail' | 'warn';
    duration?: number;
    error?: string;
  }>;
  timestamp: number;
  version?: string;
}

/**
 * Backup and restore action results
 */
export interface BackupActionResult extends BaseActionResult {
  backupId?: string;
  backupUrl?: string;
  size?: number;
  format?: string;
  expiresAt?: number;
}

export interface RestoreActionResult extends BaseActionResult {
  restoreId?: string;
  restoredItems?: number;
  skippedItems?: number;
  failedItems?: number;
}

/**
 * Webhook action results
 */
export interface WebhookActionResult extends BaseActionResult {
  webhookId?: string;
  eventType?: string;
  deliveryStatus?: 'pending' | 'delivered' | 'failed' | 'retrying';
  attempts?: number;
  nextRetry?: number;
}

/**
 * Cache action results
 */
export interface CacheActionResult extends BaseActionResult {
  key?: string;
  operation: 'get' | 'set' | 'delete' | 'clear' | 'flush';
  hit?: boolean;
  ttl?: number;
  size?: number;
}

/**
 * Rate limit action results
 */
export interface RateLimitResult extends BaseActionResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

/**
 * Feature flag action results
 */
export interface FeatureFlagResult extends BaseActionResult {
  flagName: string;
  enabled: boolean;
  variant?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Union types for convenience
 */
export type AnyActionResult =
  | BaseActionResult
  | ActionResult
  | ActionErrorResult
  | ActionSuccessResult
  | FormActionResult
  | LoginActionResult
  | LogoutActionResult
  | ProfileUpdateResult
  | PasswordChangeResult
  | UploadActionResult
  | ContactFormResult
  | ValidationResult
  | BulkActionResult
  | SearchActionResult
  | ExportActionResult
  | ImportActionResult
  | HealthCheckResult;

/**
 * Type guards for action results
 */
export const isActionSuccess = <T>(
  result: ActionResult<T>
): result is ActionSuccessResult<T> => result.success === true;

export const isActionError = <T>(
  result: ActionResult<T>
): result is ActionErrorResult => result.success === false;

export const hasData = <T>(
  result: ActionResult<T>
): result is ActionResult<T> & { data: T } => result.data !== undefined;

export const hasFieldErrors = <T>(
  result: FormActionResult<T>
): result is FormActionResult<T> & { fieldErrors: Record<string, string[]> } =>
  result.fieldErrors !== undefined &&
  Object.keys(result.fieldErrors).length > 0;

/**
 * Helper functions for creating action results
 */
export const createSuccessResult = <T>(
  message: string,
  data?: T
): ActionSuccessResult<T> => ({
  success: true,
  message,
  data,
  timestamp: Date.now(),
});

export const createErrorResult = (
  message: string,
  error?: string,
  code?: string,
  field?: string
): ActionErrorResult => ({
  success: false,
  message,
  error,
  code,
  field,
  timestamp: Date.now(),
});

export const createFormErrorResult = <T>(
  message: string,
  fieldErrors?: Record<string, string[]>,
  formError?: string
): FormActionResult<T> => ({
  success: false,
  message,
  fieldErrors,
  formError,
  timestamp: Date.now(),
});

export const createValidationResult = (
  isValid: boolean,
  message: string,
  errors?: string[],
  warnings?: string[]
): ValidationResult => ({
  success: isValid,
  message,
  isValid,
  errors,
  warnings,
  timestamp: Date.now(),
});

/**
 * Default action result values
 */
export const DEFAULT_SUCCESS_MESSAGE = 'Operation completed successfully';
export const DEFAULT_ERROR_MESSAGE =
  'An error occurred while processing your request';
export const DEFAULT_VALIDATION_ERROR_MESSAGE = 'Validation failed';
export const DEFAULT_AUTHENTICATION_ERROR_MESSAGE = 'Authentication required';
export const DEFAULT_AUTHORIZATION_ERROR_MESSAGE = 'Insufficient permissions';
export const DEFAULT_NOT_FOUND_MESSAGE = 'Resource not found';
export const DEFAULT_RATE_LIMIT_MESSAGE = 'Rate limit exceeded';
export const DEFAULT_SERVER_ERROR_MESSAGE = 'Internal server error';
