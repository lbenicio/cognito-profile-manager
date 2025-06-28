/**
 * API response interfaces for standardized API responses.
 */

/**
 * Base API response interface
 */
export interface BaseApiResponse {
  success: boolean;
  message: string;
}

/**
 * API response with data payload
 */
export interface ApiResponse<T = unknown> extends BaseApiResponse {
  data?: T;
}

/**
 * API error response
 */
export interface ApiErrorResponse extends BaseApiResponse {
  success: false;
  error?: string;
  code?: string;
  details?: Record<string, unknown>;
}

/**
 * API success response
 */
export interface ApiSuccessResponse<T = unknown> extends BaseApiResponse {
  success: true;
  data?: T;
}

/**
 * Upload action response with presigned URL
 */
export interface UploadActionResponse extends BaseApiResponse {
  presignedUrl?: string;
  uploadUrl?: string;
}

/**
 * Admin action response with data
 */
export interface AdminActionResponse<T = unknown> extends ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Paginated API response
 */
export interface PaginatedApiResponse<T = unknown> extends ApiSuccessResponse<T[]> {
  pagination: PaginationMeta;
}

/**
 * HTTP request information
 */
export interface RequestInfo {
  method: string;
  url: string;
  headers?: Record<string, string>;
  timestamp: number;
  requestId?: string;
}

/**
 * HTTP response information
 */
export interface ResponseInfo {
  statusCode: number;
  headers?: Record<string, string>;
  timestamp: number;
  duration?: number;
}

/**
 * API endpoint metadata
 */
export interface ApiEndpointMeta {
  endpoint: string;
  method: string;
  version?: string;
  deprecated?: boolean;
  rateLimited?: boolean;
}

/**
 * Error details for API responses
 */
export interface ApiErrorDetails {
  field?: string;
  code?: string;
  message: string;
  value?: unknown;
}

/**
 * Validation error response
 */
export interface ValidationErrorResponse extends ApiErrorResponse {
  errors: ApiErrorDetails[];
  fieldErrors?: Record<string, string[]>;
}

/**
 * Rate limit information
 */
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

/**
 * API response with rate limit info
 */
export interface RateLimitedResponse extends BaseApiResponse {
  rateLimit: RateLimitInfo;
}

/**
 * Health check response
 */
export interface HealthCheckResponse extends BaseApiResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: number;
  version?: string;
  uptime?: number;
  checks?: Array<{
    name: string;
    status: 'pass' | 'fail' | 'warn';
    duration?: number;
    error?: string;
  }>;
}

/**
 * Batch operation response
 */
export interface BatchOperationResponse<T = unknown> extends BaseApiResponse {
  total: number;
  processed: number;
  successful: number;
  failed: number;
  results?: T[];
  errors?: Array<{
    index: number;
    error: string;
    item?: unknown;
  }>;
}

/**
 * Search response
 */
export interface SearchResponse<T = unknown> extends PaginatedApiResponse<T> {
  query: string;
  totalResults: number;
  searchTime: number;
  filters?: Record<string, unknown>;
  facets?: Record<string, number>;
  suggestions?: string[];
}

/**
 * File upload response
 */
export interface FileUploadResponse extends BaseApiResponse {
  file?: {
    id: string;
    name: string;
    size: number;
    type: string;
    url: string;
    uploadedAt: number;
  };
  uploadUrl?: string;
  presignedUrl?: string;
}

/**
 * Export response
 */
export interface ExportResponse extends BaseApiResponse {
  exportId: string;
  downloadUrl?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  format: 'csv' | 'json' | 'pdf' | 'xlsx';
  recordCount?: number;
  estimatedTime?: number;
  expiresAt?: number;
}

/**
 * Import response
 */
export interface ImportResponse extends BaseApiResponse {
  importId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
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
 * Cache response information
 */
export interface CacheInfo {
  hit: boolean;
  key?: string;
  ttl?: number;
  generatedAt?: number;
}

/**
 * API response with cache information
 */
export interface CachedApiResponse<T = unknown> extends ApiResponse<T> {
  cache: CacheInfo;
}

/**
 * Webhook delivery response
 */
export interface WebhookResponse extends BaseApiResponse {
  webhookId: string;
  eventType: string;
  deliveryStatus: 'pending' | 'delivered' | 'failed' | 'retrying';
  attempts: number;
  nextRetry?: number;
  lastError?: string;
}

/**
 * Audit log response
 */
export interface AuditLogResponse extends BaseApiResponse {
  auditId: string;
  resource: string;
  action: string;
  userId?: string;
  timestamp: number;
  changes?: Record<string, { old: unknown; new: unknown }>;
  metadata?: Record<string, unknown>;
}

/**
 * Feature flag response
 */
export interface FeatureFlagResponse extends BaseApiResponse {
  flagName: string;
  enabled: boolean;
  variant?: string;
  metadata?: Record<string, unknown>;
  evaluatedAt: number;
}

/**
 * Metrics response
 */
export interface MetricsResponse extends BaseApiResponse {
  metrics: Array<{
    name: string;
    value: number;
    unit?: string;
    timestamp: number;
    tags?: Record<string, string>;
  }>;
  period?: {
    start: number;
    end: number;
  };
}
