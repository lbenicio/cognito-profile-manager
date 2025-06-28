/**
 * Environment configuration types for type-safe environment variables.
 */

/**
 * Application environment types
 */
export type Environment = 'development' | 'production' | 'test';

/**
 * Log level string types
 */
export type LogLevelString = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'SILENT';

/**
 * Required environment variables
 */
export interface RequiredEnvVars {
  // AWS Configuration
  AWS_REGION: string;

  // Cognito Configuration
  NEXT_PUBLIC_COGNITO_CLIENT_ID: string;
  NEXT_PUBLIC_COGNITO_WELLKNOWN: string;

  // Application Configuration
  APP_URL: string;
  NEXTAUTH_SECRET: string;
}

/**
 * Optional environment variables with defaults
 */
export interface OptionalEnvVars {
  // Node Environment
  NODE_ENV: Environment;

  // Port Configuration
  PORT: string;

  // Logging Configuration
  LOG_LEVEL: LogLevelString;

  // Redis Configuration (optional)
  REDIS_URL?: string;
  REDIS_HOST?: string;
  REDIS_PORT?: string;
  REDIS_PASSWORD?: string;

  // R2/S3 Configuration (optional)
  R2_ENDPOINT?: string;
  R2_ACCESS_KEY_ID?: string;
  R2_SECRET_ACCESS_KEY?: string;
  R2_BUCKET_NAME?: string;
  R2_PUBLIC_URL?: string;

  // SMTP Configuration (optional)
  SMTP_HOST?: string;
  SMTP_PORT?: string;
  SMTP_USER?: string;
  SMTP_PASS?: string;
  SMTP_FROM?: string;

  // Feature Flags
  ENABLE_DEV_LOGIN?: string;
  ENABLE_MOCK_DATA?: string;
  ENABLE_DEBUG_LOGS?: string;

  // Security Configuration
  SESSION_COOKIE_NAME?: string;
  SESSION_MAX_AGE?: string;
  CORS_ORIGINS?: string;

  // Analytics and Monitoring (optional)
  ANALYTICS_ID?: string;
  MONITORING_ENDPOINT?: string;

  // Cognito Advanced Settings (optional)
  COGNITO_USER_POOL_ID?: string;
  COGNITO_IDENTITY_POOL_ID?: string;

  // Email Templates (optional)
  EMAIL_TEMPLATE_DIR?: string;

  // Rate Limiting (optional)
  RATE_LIMIT_MAX?: string;
  RATE_LIMIT_WINDOW?: string;
}

/**
 * Complete environment configuration
 */
export type EnvironmentConfig = RequiredEnvVars & OptionalEnvVars;

/**
 * Environment validation result
 */
export interface EnvValidationResult {
  isValid: boolean;
  missing: string[];
  invalid: string[];
  warnings: string[];
}

/**
 * Feature flags extracted from environment
 */
export interface FeatureFlags {
  enableDevLogin: boolean;
  enableMockData: boolean;
  enableDebugLogs: boolean;
}

/**
 * Database configuration
 */
export interface DatabaseConfig {
  redis?: {
    url?: string;
    host?: string;
    port: number;
    password?: string;
  };
}

/**
 * Storage configuration
 */
export interface StorageConfig {
  r2?: {
    endpoint: string;
    accessKeyId: string;
    secretAccessKey: string;
    bucketName: string;
    publicUrl: string;
  };
}

/**
 * SMTP configuration
 */
export interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
}

/**
 * Security configuration
 */
export interface SecurityConfig {
  sessionCookieName: string;
  sessionMaxAge: number;
  corsOrigins: string[];
  nextAuthSecret: string;
}

/**
 * Application configuration derived from environment
 */
export interface AppConfig {
  env: Environment;
  port: number;
  appUrl: string;
  logLevel: LogLevelString;
  features: FeatureFlags;
  database: DatabaseConfig;
  storage: StorageConfig;
  smtp?: SmtpConfig;
  security: SecurityConfig;
  aws: {
    region: string;
  };
  cognito: {
    clientId: string;
    wellknownUrl: string;
    userPoolId?: string;
    identityPoolId?: string;
  };
}

/**
 * Environment variable defaults
 */
export const ENV_DEFAULTS: Partial<OptionalEnvVars> = {
  NODE_ENV: 'development' as Environment,
  PORT: '3000',
  LOG_LEVEL: 'INFO' as LogLevelString,
  SESSION_COOKIE_NAME: 'session',
  SESSION_MAX_AGE: '86400', // 24 hours
  RATE_LIMIT_MAX: '100',
  RATE_LIMIT_WINDOW: '900', // 15 minutes
  ENABLE_DEV_LOGIN: 'false',
  ENABLE_MOCK_DATA: 'false',
  ENABLE_DEBUG_LOGS: 'false',
};

/**
 * Required environment variables list
 */
export const REQUIRED_ENV_VARS: (keyof RequiredEnvVars)[] = [
  'AWS_REGION',
  'NEXT_PUBLIC_COGNITO_CLIENT_ID',
  'NEXT_PUBLIC_COGNITO_WELLKNOWN',
  'APP_URL',
  'NEXTAUTH_SECRET',
];

/**
 * Environment variable validation patterns
 */
export const ENV_VALIDATION_PATTERNS: Record<string, RegExp> = {
  AWS_REGION: /^[a-z0-9-]+$/,
  APP_URL: /^https?:\/\/.+$/,
  NEXT_PUBLIC_COGNITO_WELLKNOWN:
    /^https:\/\/.+\.well-known\/openid_configuration$/,
  SMTP_PORT: /^\d+$/,
  REDIS_PORT: /^\d+$/,
  PORT: /^\d+$/,
  SESSION_MAX_AGE: /^\d+$/,
  RATE_LIMIT_MAX: /^\d+$/,
  RATE_LIMIT_WINDOW: /^\d+$/,
};

/**
 * Type for environment variable keys
 */
export type EnvVarKey = keyof EnvironmentConfig;

/**
 * Type for environment variable values
 */
export type EnvVarValue = string | undefined;

/**
 * Environment variable getter type
 */
export type EnvGetter = (key: EnvVarKey) => EnvVarValue;

/**
 * Runtime environment information
 */
export interface RuntimeEnv {
  isServer: boolean;
  isClient: boolean;
  isDevelopment: boolean;
  isProduction: boolean;
  isTest: boolean;
}
