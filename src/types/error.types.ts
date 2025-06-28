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
  | SessionError;

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
      statusCode: code === 'UNAUTHORIZED' ? 401 : code === 'FORBIDDEN' ? 403 : 400,
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
  typeof error === 'object' && error !== null && (error as AppError).name === 'AuthError';

export const isValidationError = (error: unknown): error is ValidationError =>
  typeof error === 'object' && error !== null && (error as AppError).name === 'ValidationError';

export const isApiError = (error: unknown): error is ApiError =>
  typeof error === 'object' && error !== null && (error as AppError).name === 'ApiError';

export const isCognitoError = (error: unknown): error is CognitoError =>
  typeof error === 'object' && error !== null && (error as AppError).name === 'CognitoError';

export const isUploadError = (error: unknown): error is UploadError =>
  typeof error === 'object' && error !== null && (error as AppError).name === 'UploadError';

export const isAppError = (error: unknown): error is ApplicationError =>
  isAuthError(error) ||
  isValidationError(error) ||
  isApiError(error) ||
  isCognitoError(error) ||
  isUploadError(error);
