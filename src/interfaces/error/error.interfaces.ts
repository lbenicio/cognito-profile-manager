/**
 * Error interfaces for structured error handling.
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
 * Authentication error interface
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
 * Validation error interface
 */
export interface ValidationError extends AppError {
  name: 'ValidationError';
  code: 'INVALID_INPUT' | 'MISSING_REQUIRED_FIELD' | 'INVALID_FORMAT';
  fieldErrors?: Record<string, string[]>;
}

/**
 * API error interface
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
 * Cognito-specific error interface
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
 * Upload error interface
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
 * Form error interface
 */
export interface FormError extends AppError {
  name: 'FormError';
  code: 'VALIDATION_FAILED' | 'SUBMISSION_FAILED' | 'FIELD_ERROR';
  field?: string;
  value?: unknown;
}

/**
 * Configuration error interface
 */
export interface ConfigError extends AppError {
  name: 'ConfigError';
  code: 'MISSING_ENV_VAR' | 'INVALID_CONFIG' | 'CONFIG_LOAD_FAILED';
  configKey?: string;
}

/**
 * Database/Session error interface
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

/**
 * Network error interface
 */
export interface NetworkError extends AppError {
  name: 'NetworkError';
  code:
    | 'CONNECTION_FAILED'
    | 'TIMEOUT'
    | 'DNS_ERROR'
    | 'SSL_ERROR'
    | 'PROXY_ERROR';
  url?: string;
  timeout?: number;
}

/**
 * Permission error interface
 */
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

/**
 * Rate limit error interface
 */
export interface RateLimitError extends AppError {
  name: 'RateLimitError';
  code: 'RATE_LIMIT_EXCEEDED' | 'QUOTA_EXCEEDED' | 'THROTTLED';
  limit?: number;
  remaining?: number;
  resetTime?: number;
  retryAfter?: number;
}

/**
 * Business logic error interface
 */
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

/**
 * External service error interface
 */
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

/**
 * Error context interface
 */
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

/**
 * Error report interface
 */
export interface ErrorReport {
  error: AppError;
  context: ErrorContext;
  severity: 'low' | 'medium' | 'high' | 'critical';
  handled: boolean;
  reportedAt: number;
  fingerprint?: string;
}

/**
 * Error handler interface
 */
export interface ErrorHandler {
  canHandle(error: unknown): boolean;
  handle(error: AppError, context: ErrorContext): Promise<void> | void;
  priority: number;
}

/**
 * Error recovery interface
 */
export interface ErrorRecovery {
  canRecover(error: AppError): boolean;
  recover(error: AppError, context: ErrorContext): Promise<unknown>;
  maxAttempts: number;
}

/**
 * Error logging interface
 */
export interface ErrorLogger {
  log(error: AppError, context: ErrorContext): Promise<void> | void;
  logReport(report: ErrorReport): Promise<void> | void;
}

/**
 * Error aggregation interface
 */
export interface ErrorAggregation {
  count: number;
  firstOccurrence: number;
  lastOccurrence: number;
  fingerprint: string;
  error: AppError;
  contexts: ErrorContext[];
}

/**
 * Error notification interface
 */
export interface ErrorNotification {
  recipients: string[];
  threshold: number;
  cooldown: number;
  channels: ('email' | 'slack' | 'webhook')[];
  template?: string;
}

/**
 * Error configuration interface
 */
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
