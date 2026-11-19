/**
 * API response types for standardized API responses.
 * Contains only type aliases, unions, and enums. All interfaces are in @/types/contracts/api/
 */

/**
 * Authentication action response type
 */
export type AuthActionResponse = {
  success: boolean;
  message: string;
};

/**
 * Profile action response type
 */
export type ProfileActionResponse = {
  success: boolean;
  message: string;
};

/**
 * Passkey action response type
 */
export type PasskeyActionResponse = {
  success: boolean;
  message: string;
};

/**
 * MFA action response type
 */
export type MfaActionResponse = {
  success: boolean;
  message: string;
};

/**
 * Password action response type
 */
export type PasswordActionResponse = {
  success: boolean;
  message: string;
};

/**
 * Notification action response type
 */
export type NotificationActionResponse = {
  success: boolean;
  message: string;
};

/**
 * Preference action response type
 */
export type PreferenceActionResponse = {
  success: boolean;
  message: string;
};

/**
 * Contact action response type
 */
export type ContactActionResponse = {
  success: boolean;
  message: string;
};

/**
 * HTTP status codes
 */
export type HttpStatusCode =
  | 200
  | 201
  | 202
  | 204
  | 400
  | 401
  | 403
  | 404
  | 409
  | 422
  | 429
  | 500
  | 502
  | 503
  | 504;

/**
 * HTTP methods
 */
export type HttpMethod =
  'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

/**
 * API response status
 */
export type ApiResponseStatus = 'success' | 'error' | 'pending' | 'timeout';

/**
 * Content types
 */
export type ContentType =
  | 'application/json'
  | 'application/xml'
  | 'text/html'
  | 'text/plain'
  | 'multipart/form-data'
  | 'application/x-www-form-urlencoded';

/**
 * Cache control directives
 */
export type CacheControlDirective =
  | 'no-cache'
  | 'no-store'
  | 'must-revalidate'
  | 'public'
  | 'private'
  | 'max-age';

/**
 * API version types
 */
export type ApiVersion = 'v1' | 'v2' | 'beta' | 'alpha';

/**
 * Sort order types
 */
export type SortOrder = 'asc' | 'desc';

/**
 * Export format types
 */
export type ExportFormat = 'csv' | 'json' | 'pdf' | 'xlsx' | 'xml';

/**
 * Import status types
 */
export type ImportStatus =
  'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

/**
 * Webhook delivery status types
 */
export type WebhookDeliveryStatus =
  'pending' | 'delivered' | 'failed' | 'retrying';

/**
 * Health check status types
 */
export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';

/**
 * Rate limit window types
 */
export type RateLimitWindow = 'second' | 'minute' | 'hour' | 'day';

/**
 * Re-export interfaces for convenience
 */
export type {
  BaseApiResponse,
  ApiResponse,
  ApiErrorResponse,
  ApiSuccessResponse,
  UploadActionResponse,
  AdminActionResponse,
  PaginationMeta,
  PaginatedApiResponse,
  RequestInfo,
  ResponseInfo,
  ApiEndpointMeta,
  ApiErrorDetails,
  ValidationErrorResponse,
  RateLimitInfo,
  RateLimitedResponse,
  HealthCheckResponse,
  BatchOperationResponse,
  SearchResponse,
  FileUploadResponse,
  ExportResponse,
  ImportResponse,
  CacheInfo,
  CachedApiResponse,
  WebhookResponse,
  AuditLogResponse,
  FeatureFlagResponse,
  MetricsResponse,
} from '@/types/contracts/api/response.types';
