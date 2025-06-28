/**
 * Main types index file - exports all type definitions for the application.
 * This file only exports type aliases, unions, and enums from the types/ directory.
 * All interfaces are exported from the interfaces/ directory.
 */

// ============================================================================
// TYPE ALIASES, UNIONS, AND ENUMS
// ============================================================================

// Authentication Types
export type {
  AuthState,
  AuthMethod,
  AuthEvent,
  AuthFlow,
  OAuthProvider,
  TokenType,
  PermissionAction,
  PermissionResource,
  UserRole,
  AccountStatus,
  MfaMethod,
  LoginResult,
  LogoutReason,
  DeviceType,
  BrowserType,
  OperatingSystem,
  RiskLevel,
  VerificationStatus,
  ChallengeType,
  SessionStatus,
} from './auth.types';

// Session Types
export type {
  SessionInvalidReason,
  SessionAction,
  SessionStorageType,
  TokenType as SessionTokenType,
  SessionEvent,
  SessionStatus as SessionState,
  SameSiteAttribute,
  SessionLifecycleState,
  SessionSecurityLevel,
  LogoutType,
  SessionEnvironment,
} from './session.types';

// API Response Types
export type {
  AuthActionResponse,
  ProfileActionResponse,
  PasskeyActionResponse,
  MfaActionResponse,
  PasswordActionResponse,
  NotificationActionResponse,
  PreferenceActionResponse,
  ContactActionResponse,
  HttpStatusCode,
  HttpMethod,
  ApiResponseStatus,
  ContentType,
  CacheControlDirective,
  ApiVersion,
  SortOrder,
  ExportFormat,
  ImportStatus,
  WebhookDeliveryStatus,
  HealthStatus,
  RateLimitWindow,
} from './api/response.types';

// Error Types
export type { ApplicationError } from './error.types';

// Environment Types
export type {
  Environment,
  LogLevelString,
  FeatureFlags,
  EnvVarKey,
  EnvVarValue,
  EnvGetter,
} from './env.types';

// Logger Types
export type {
  LogLevel,
  LogLevelString as LoggerLevelString,
  LogFormat,
  LogFilter,
  LogFormatter,
  LogSanitizer,
  LoggerName,
} from './logger.types';

// Middleware Types
export type {
  MiddlewareFunction,
  MiddlewareFactory,
  MiddlewareComposer,
  ConditionalMiddleware,
  PathMatcher,
  MiddlewarePriority,
  MiddlewareOrderType,
} from './middleware.types';

// Utility Types
export type {
  DeepPartial,
  DeepRequired,
  PartialBy,
  RequiredBy,
  KeysOfType,
  ExcludeKeysOfType,
  PickByType,
  OmitByType,
  Nullable,
  Optional,
  Maybe,
  NonNullable,
  ArrayElement,
  PromiseResolveType,
  Parameters,
  ReturnType,
  AsyncReturnType,
  ValueOf,
  Entries,
  StringLiteralArray,
  StringLiteral,
  TupleToUnion,
  UnionToIntersection,
  Mutable,
  Immutable,
  DeepReadonly,
  DeepMutable,
  Brand,
  Opaque,
  JsonPrimitive,
  JsonObject,
  JsonArray,
  JsonValue,
  JsonSerializable,
  Constructor,
  AbstractConstructor,
  Class,
  Mixin,
  EventHandler,
  AsyncEventHandler,
  Callback,
  AsyncCallback,
  Predicate,
  AsyncPredicate,
  Mapper,
  AsyncMapper,
  Reducer,
  Comparator,
  Validator,
  AsyncValidator,
  Transform,
  AsyncTransform,
  Factory,
  AsyncFactory,
  Result,
  Option,
  Either,
  Try,
  Lazy,
  Thunk,
  Path,
  PathValue,
  Flatten,
  Environment as UtilEnvironment,
  HttpMethod as UtilHttpMethod,
  HttpStatusCode as UtilHttpStatusCode,
  MimeType,
  CssUnit,
  CssValue,
  HexColor,
  RgbColor,
  RgbaColor,
  HslColor,
  HslaColor,
  Color,
  DateString,
  TimeString,
  DateTimeString,
  UUID,
  UserId,
  SessionId,
  RequestId,
  Url,
  Email,
  PhoneNumber,
} from './utils.types';

// Action Types

// Country Types
export * from './country.types';

// Form Types
export * from './forms/account-form.types';
export * from './forms/address-form.types';
export * from './forms/password-form.types';
export * from './forms/profile-form.types';

// R2/Storage Types
export * from './r2.types';

// Toast Types
export * from './toast.types';

// User Types - These are in types/user/ so they're proper types
export * from './user/user.types';

// ============================================================================
// RE-EXPORTS FROM INTERFACES (for convenience)
// ============================================================================

// Auth Interfaces
export type {
  LoginCredentials,
  SsoLoginParams,
  PasskeyAuthParams,
  MfaVerificationParams,
  AuthResult,
  TokenValidation,
  AuthTokenPayload,
  OAuthCallbackParams,
  OAuthTokenResponse,
  AuthProviderConfig,
  AuthContext,
  AuthUser,
  AuthEventData,
  Permission,
  Role,
  AuthorizationContext,
  PasswordPolicy,
  SecuritySettings,
  LoginAttempt,
  AuthAuditLog,
  AuthDevice,
  AuthConfig,
} from '@/interfaces/auth/auth.interfaces';

// Session Interfaces
export type {
  BaseSession,
  SessionClaims,
  AuthSession,
  SessionFingerprint,
  CreateSessionParams,
  UpdateSessionParams,
  SessionStorage,
  SessionCookieConfig,
  SessionValidation,
  SessionSecurityPolicy,
  SessionActivity,
  MockSessionConfig,
  SessionManager,
  TokenRefreshConfig,
  SessionConfig,
  SessionContext,
  SessionMetrics,
} from '@/interfaces/session/session.interfaces';

// API Interfaces
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
} from '@/interfaces/api/response.interfaces';

// Error Interfaces
export type {
  AppError,
  AuthError,
  ValidationError,
  ApiError,
  CognitoError,
  UploadError,
  FormError,
  ConfigError,
  SessionError,
  NetworkError,
  PermissionError,
  RateLimitError,
  BusinessLogicError,
  ExternalServiceError,
  ErrorContext,
  ErrorReport,
  ErrorHandler,
  ErrorRecovery,
  ErrorLogger,
  ErrorAggregation,
  ErrorNotification,
  ErrorConfig,
} from '@/interfaces/error/error.interfaces';

// Action Interfaces
export type {
  BaseActionResult,
  ActionResult,
  ActionErrorResult,
  ActionSuccessResult,
  FormActionResult,
  LoginActionResult,
  LogoutActionResult,
  MfaVerificationResult,
  ProfileUpdateResult,
  AvatarUpdateResult,
  BannerUpdateResult,
  PasswordChangeResult,
  PasskeyActionResult,
  DeviceActionResult,
  PreferencesUpdateResult,
  NotificationSettingsResult,
  PrivacySettingsResult,
  UploadActionResult,
  ContactFormResult,
  UserManagementResult,
  GroupManagementResult,
  SessionActionResult,
  ValidationResult,
  EmailVerificationResult,
  PhoneVerificationResult,
  BulkActionResult,
  SearchActionResult,
  ExportActionResult,
  ImportActionResult,
  AuditActionResult,
  HealthCheckResult,
  BackupActionResult,
  RestoreActionResult,
  WebhookActionResult,
  CacheActionResult,
  RateLimitResult,
  FeatureFlagResult,
  FileOperationResult,
  DatabaseOperationResult,
  EmailOperationResult,
  NotificationOperationResult,
  SyncOperationResult,
} from '@/interfaces/actions/action.interfaces';

// Helper functions and constants from actions.types
export {
  isActionSuccess,
  isActionError,
  hasData,
  hasFieldErrors,
  createSuccessResult,
  createErrorResult,
  createFormErrorResult,
  createValidationResult,
  DEFAULT_SUCCESS_MESSAGE,
  DEFAULT_ERROR_MESSAGE,
  DEFAULT_VALIDATION_ERROR_MESSAGE,
  DEFAULT_AUTHENTICATION_ERROR_MESSAGE,
  DEFAULT_AUTHORIZATION_ERROR_MESSAGE,
  DEFAULT_NOT_FOUND_MESSAGE,
  DEFAULT_RATE_LIMIT_MESSAGE,
  DEFAULT_SERVER_ERROR_MESSAGE,
} from './actions.types';

export type { AnyActionResult } from './actions.types';

// Error factory and type guards
export {
  ErrorFactory,
  isAuthError,
  isValidationError,
  isApiError,
  isCognitoError,
  isUploadError,
  isAppError,
} from './error.types';

// Environment constants
export {
  ENV_DEFAULTS,
  REQUIRED_ENV_VARS,
  ENV_VALIDATION_PATTERNS,
} from './env.types';

// Logger constants
export {
  LOGGER_NAMES,
  LOG_LEVEL_MAP,
  DEFAULT_LOGGER_CONFIG,
} from './logger.types';

// Middleware constants
export { MIDDLEWARE_PATTERNS, MIDDLEWARE_ORDER } from './middleware.types';

// Session constants
export { DEFAULT_SESSION_CONFIG } from './session.types';

// Auth constants
export { DEFAULT_AUTH_CONFIG } from './auth.types';
