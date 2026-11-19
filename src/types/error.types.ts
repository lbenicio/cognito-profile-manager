/**
 * Standardized error types for the application.
 */

/**
 * Base application error interface
 */
export interface AppError {
  name: string;
  message: string;
  code?: string;
  statusCode?: number;
  details?: Record<string, unknown>;
  stack?: string;
}

/**
 * Authentication errors
 */
export interface AuthError extends AppError {
  name: 'AuthError';
  code:
    | 'AUTHENTICATION_REQUIRED'
    | 'INVALID_CREDENTIALS'
    | 'TOKEN_EXPIRED'
    | 'TOKEN_INVALID'
    | 'SESSION_EXPIRED'
    | 'UNAUTHORIZED'
    | 'FORBIDDEN';
}

/**
 * Validation errors
 */
export interface ValidationError extends AppError {
  name: 'ValidationError';
  code: 'INVALID_INPUT' | 'MISSING_REQUIRED_FIELD' | 'INVALID_FORMAT';
  fieldErrors?: Record<string, string[]>;
}

/**
 * API errors
 */
export interface ApiError extends AppError {
  name: 'ApiError';
  code:
    | 'NETWORK_ERROR'
    | 'SERVER_ERROR'
    | 'NOT_FOUND'
    | 'BAD_REQUEST'
    | 'RATE_LIMITED'
    | 'SERVICE_UNAVAILABLE';
  endpoint?: string;
  method?: string;
}

/**
 * Cognito-specific errors
 */
export interface CognitoError extends AppError {
  name: 'CognitoError';
  code:
    | 'USER_NOT_FOUND'
    | 'INVALID_PASSWORD'
    | 'PASSWORD_RESET_REQUIRED'
    | 'USER_NOT_CONFIRMED'
    | 'TOO_MANY_REQUESTS'
    | 'LIMIT_EXCEEDED'
    | 'NOT_AUTHORIZED'
    | 'INVALID_PARAMETER'
    | 'RESOURCE_NOT_FOUND';
  cognitoCode?: string;
}

/**
 * Upload errors
 */
export interface UploadError extends AppError {
  name: 'UploadError';
  code:
    | 'FILE_TOO_LARGE'
    | 'INVALID_FILE_TYPE'
    | 'UPLOAD_FAILED'
    | 'PRESIGNED_URL_EXPIRED'
    | 'STORAGE_ERROR';
  fileName?: string;
  fileSize?: number;
  maxSize?: number;
}

/**
 * Form errors
 */
export interface FormError extends AppError {
  name: 'FormError';
  code: 'VALIDATION_FAILED' | 'SUBMISSION_FAILED' | 'FIELD_ERROR';
  field?: string;
  value?: unknown;
}

/**
 * Configuration errors
 */
export interface ConfigError extends AppError {
  name: 'ConfigError';
  code: 'MISSING_ENV_VAR' | 'INVALID_CONFIG' | 'CONFIG_LOAD_FAILED';
  configKey?: string;
}

/**
 * Database/Session errors
 */
export interface SessionError extends AppError {
  name: 'SessionError';
  code:
    | 'SESSION_CREATE_FAILED'
    | 'SESSION_READ_FAILED'
    | 'SESSION_UPDATE_FAILED'
    | 'SESSION_DELETE_FAILED'
    | 'SESSION_EXPIRED'
    | 'SESSION_INVALID';
}

export interface NetworkError extends AppError {
  name: 'NetworkError';
  code:
    'CONNECTION_FAILED' | 'TIMEOUT' | 'DNS_ERROR' | 'SSL_ERROR' | 'PROXY_ERROR';
  url?: string;
  timeout?: number;
}

export interface PermissionError extends AppError {
  name: 'PermissionError';
  code:
    | 'ACCESS_DENIED'
    | 'INSUFFICIENT_PERMISSIONS'
    | 'ROLE_REQUIRED'
    | 'RESOURCE_FORBIDDEN';
  resource?: string;
  action?: string;
  requiredRole?: string;
}

export interface RateLimitError extends AppError {
  name: 'RateLimitError';
  code: 'RATE_LIMIT_EXCEEDED' | 'QUOTA_EXCEEDED' | 'THROTTLED';
  limit?: number;
  remaining?: number;
  resetTime?: number;
  retryAfter?: number;
}

export interface BusinessLogicError extends AppError {
  name: 'BusinessLogicError';
  code:
    | 'BUSINESS_RULE_VIOLATION'
    | 'OPERATION_NOT_ALLOWED'
    | 'CONSTRAINT_VIOLATION'
    | 'INVALID_STATE';
  rule?: string;
  constraint?: string;
}

export interface ExternalServiceError extends AppError {
  name: 'ExternalServiceError';
  code:
    | 'SERVICE_UNAVAILABLE'
    | 'SERVICE_TIMEOUT'
    | 'SERVICE_ERROR'
    | 'API_ERROR'
    | 'INTEGRATION_ERROR';
  service?: string;
  serviceResponse?: unknown;
}

export interface ErrorContext {
  userId?: string;
  sessionId?: string;
  requestId?: string;
  traceId?: string;
  timestamp: number;
  userAgent?: string;
  ipAddress?: string;
  path?: string;
  method?: string;
  metadata?: Record<string, unknown>;
}

export interface ErrorReport {
  error: AppError;
  context: ErrorContext;
  severity: 'low' | 'medium' | 'high' | 'critical';
  handled: boolean;
  reportedAt: number;
  fingerprint?: string;
}

export interface ErrorHandler {
  canHandle(error: unknown): boolean;
  handle(error: AppError, context: ErrorContext): Promise<void> | void;
  priority: number;
}

export interface ErrorRecovery {
  canRecover(error: AppError): boolean;
  recover(error: AppError, context: ErrorContext): Promise<unknown>;
  maxAttempts: number;
}

export interface ErrorLogger {
  log(error: AppError, context: ErrorContext): Promise<void> | void;
  logReport(report: ErrorReport): Promise<void> | void;
}

export interface ErrorAggregation {
  count: number;
  firstOccurrence: number;
  lastOccurrence: number;
  fingerprint: string;
  error: AppError;
  contexts: ErrorContext[];
}

export interface ErrorNotification {
  recipients: string[];
  threshold: number;
  cooldown: number;
  channels: ('email' | 'slack' | 'webhook')[];
  template?: string;
}

export interface ErrorConfig {
  enableLogging: boolean;
  enableReporting: boolean;
  enableNotifications: boolean;
  enableRecovery: boolean;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  handlers: ErrorHandler[];
  recoveryStrategies: ErrorRecovery[];
  notifications: Record<string, ErrorNotification>;
}

/**
 * Union type of all application errors
 */
export type ApplicationError =
  | AuthError
  | ValidationError
  | ApiError
  | CognitoError
  | UploadError
  | FormError
  | ConfigError
  | SessionError
  | NetworkError
  | PermissionError
  | RateLimitError
  | BusinessLogicError
  | ExternalServiceError;

/**
 * Error factory functions
 */
export class ErrorFactory {
  static createAuthError(
    code: AuthError['code'],
    message: string,
    details?: Record<string, unknown>
  ): AuthError {
    return {
      name: 'AuthError',
      code,
      message,
      details,
      statusCode:
        code === 'UNAUTHORIZED' ? 401 : code === 'FORBIDDEN' ? 403 : 400,
    };
  }

  static createValidationError(
    message: string,
    fieldErrors?: Record<string, string[]>,
    details?: Record<string, unknown>
  ): ValidationError {
    return {
      name: 'ValidationError',
      code: 'INVALID_INPUT',
      message,
      fieldErrors,
      details,
      statusCode: 400,
    };
  }

  static createApiError(
    code: ApiError['code'],
    message: string,
    endpoint?: string,
    method?: string,
    details?: Record<string, unknown>
  ): ApiError {
    const statusCodeMap: Record<ApiError['code'], number> = {
      NETWORK_ERROR: 0,
      SERVER_ERROR: 500,
      NOT_FOUND: 404,
      BAD_REQUEST: 400,
      RATE_LIMITED: 429,
      SERVICE_UNAVAILABLE: 503,
    };

    return {
      name: 'ApiError',
      code,
      message,
      endpoint,
      method,
      details,
      statusCode: statusCodeMap[code] || 500,
    };
  }

  static createCognitoError(
    code: CognitoError['code'],
    message: string,
    cognitoCode?: string,
    details?: Record<string, unknown>
  ): CognitoError {
    return {
      name: 'CognitoError',
      code,
      message,
      cognitoCode,
      details,
      statusCode: 400,
    };
  }

  static createUploadError(
    code: UploadError['code'],
    message: string,
    fileName?: string,
    fileSize?: number,
    maxSize?: number
  ): UploadError {
    return {
      name: 'UploadError',
      code,
      message,
      fileName,
      fileSize,
      maxSize,
      statusCode: 400,
    };
  }
}

/**
 * Type guards for error types
 */
export const isAuthError = (error: unknown): error is AuthError =>
  typeof error === 'object' &&
  error !== null &&
  (error as AppError).name === 'AuthError';

export const isValidationError = (error: unknown): error is ValidationError =>
  typeof error === 'object' &&
  error !== null &&
  (error as AppError).name === 'ValidationError';

export const isApiError = (error: unknown): error is ApiError =>
  typeof error === 'object' &&
  error !== null &&
  (error as AppError).name === 'ApiError';

export const isCognitoError = (error: unknown): error is CognitoError =>
  typeof error === 'object' &&
  error !== null &&
  (error as AppError).name === 'CognitoError';

export const isUploadError = (error: unknown): error is UploadError =>
  typeof error === 'object' &&
  error !== null &&
  (error as AppError).name === 'UploadError';

export const isAppError = (error: unknown): error is ApplicationError =>
  isAuthError(error) ||
  isValidationError(error) ||
  isApiError(error) ||
  isCognitoError(error) ||
  isUploadError(error);
