/**
 * Logger types and interfaces for the application logging system.
 */

/**
 * Log levels enumeration
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  SILENT = 4,
}

/**
 * Log level string representations
 */
export type LogLevelString = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'SILENT';

/**
 * Logger configuration options
 */
export interface LoggerOptions {
  level?: LogLevel;
  enableColors?: boolean;
  enableTimestamp?: boolean;
  enableContext?: boolean;
  format?: LogFormat;
  transports?: LogTransport[];
}

/**
 * Log entry structure
 */
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  levelString: LogLevelString;
  message: string;
  context: string;
  environment: 'SERVER' | 'CLIENT';
  metadata?: Record<string, unknown>;
  args?: unknown[];
}

/**
 * Log formatting options
 */
export type LogFormat = 'text' | 'json' | 'custom';

/**
 * Log transport interface
 */
export interface LogTransport {
  name: string;
  level: LogLevel;
  write(entry: LogEntry): void | Promise<void>;
}

/**
 * Console transport options
 */
export interface ConsoleTransportOptions {
  level?: LogLevel;
  enableColors?: boolean;
  format?: 'text' | 'json';
}

/**
 * File transport options
 */
export interface FileTransportOptions {
  level?: LogLevel;
  filename: string;
  maxSize?: number;
  maxFiles?: number;
  format?: 'text' | 'json';
}

/**
 * Remote transport options
 */
export interface RemoteTransportOptions {
  level?: LogLevel;
  endpoint: string;
  apiKey?: string;
  headers?: Record<string, string>;
  format?: 'json';
  batchSize?: number;
  flushInterval?: number;
}

/**
 * Logger context information
 */
export interface LoggerContext {
  name: string;
  module?: string;
  component?: string;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  traceId?: string;
}

/**
 * Performance logging metadata
 */
export interface PerformanceLogMetadata {
  duration?: number;
  startTime?: number;
  endTime?: number;
  memoryUsage?: NodeJS.MemoryUsage;
  operation?: string;
}

/**
 * Error logging metadata
 */
export interface ErrorLogMetadata {
  error?: Error;
  stack?: string;
  code?: string;
  statusCode?: number;
  endpoint?: string;
  method?: string;
  userId?: string;
  requestId?: string;
}

/**
 * Audit logging metadata
 */
export interface AuditLogMetadata {
  action: string;
  resource: string;
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  success: boolean;
  details?: Record<string, unknown>;
}

/**
 * Security logging metadata
 */
export interface SecurityLogMetadata {
  event:
    | 'login'
    | 'logout'
    | 'failed_login'
    | 'permission_denied'
    | 'suspicious_activity';
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  location?: string;
  riskScore?: number;
  details?: Record<string, unknown>;
}

/**
 * Logger interface
 */
export interface ILogger {
  // Basic logging methods
  debug(message: string, ...args: unknown[]): void;
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
  log(message: string, ...args: unknown[]): void;

  // Specialized logging methods
  audit(message: string, metadata: AuditLogMetadata): void;
  security(message: string, metadata: SecurityLogMetadata): void;
  performance(message: string, metadata: PerformanceLogMetadata): void;
  errorWithMetadata(message: string, metadata: ErrorLogMetadata): void;

  // Utility methods
  child(context: Partial<LoggerContext>): ILogger;
  setLevel(level: LogLevel): void;
  getLevel(): LogLevel;
  isLevelEnabled(level: LogLevel): boolean;

  // Timing utilities
  time(label: string): void;
  timeEnd(label: string): void;
  profile(label: string): void;
  profileEnd(label: string): void;
}

/**
 * Logger factory interface
 */
export interface ILoggerFactory {
  createLogger(name: string, options?: LoggerOptions): ILogger;
  setGlobalLevel(level: LogLevel): void;
  addTransport(transport: LogTransport): void;
  removeTransport(name: string): void;
}

/**
 * Structured logging fields
 */
export interface StructuredLogFields {
  timestamp?: string;
  level?: LogLevelString;
  message?: string;
  context?: string;
  component?: string;
  module?: string;
  environment?: 'SERVER' | 'CLIENT';
  userId?: string;
  sessionId?: string;
  requestId?: string;
  traceId?: string;
  operation?: string;
  duration?: number;
  statusCode?: number;
  error?: {
    name: string;
    message: string;
    stack?: string;
    code?: string;
  };
  metadata?: Record<string, unknown>;
}

/**
 * Log filter function type
 */
export type LogFilter = (entry: LogEntry) => boolean;

/**
 * Log formatter function type
 */
export type LogFormatter = (entry: LogEntry) => string;

/**
 * Log sanitizer function type
 */
export type LogSanitizer = (data: unknown) => unknown;

/**
 * Logger middleware interface
 */
export interface LoggerMiddleware {
  name: string;
  process(entry: LogEntry): LogEntry | null;
}

/**
 * Request logging options
 */
export interface RequestLogOptions {
  includeHeaders?: boolean;
  includeBody?: boolean;
  includeQuery?: boolean;
  includeParams?: boolean;
  sensitiveFields?: string[];
  maxBodySize?: number;
}

/**
 * Response logging options
 */
export interface ResponseLogOptions {
  includeHeaders?: boolean;
  includeBody?: boolean;
  sensitiveFields?: string[];
  maxBodySize?: number;
}

/**
 * Common logger names used throughout the application
 */
export const LOGGER_NAMES = {
  APP: 'APP',
  AUTH: 'AUTH',
  API: 'API',
  DB: 'DB',
  CACHE: 'CACHE',
  SESSION: 'SESSION',
  MFA: 'MFA',
  PASSKEY: 'PASSKEY',
  PROFILE: 'PROFILE',
  NOTIFICATION: 'NOTIFICATION',
  MIDDLEWARE: 'MIDDLEWARE',
  UPLOAD: 'UPLOAD',
  EMAIL: 'EMAIL',
  SECURITY: 'SECURITY',
  AUDIT: 'AUDIT',
  PERFORMANCE: 'PERFORMANCE',
} as const;

/**
 * Logger name type
 */
export type LoggerName = (typeof LOGGER_NAMES)[keyof typeof LOGGER_NAMES];

/**
 * Log level mapping for configuration
 */
export const LOG_LEVEL_MAP: Record<LogLevelString, LogLevel> = {
  DEBUG: LogLevel.DEBUG,
  INFO: LogLevel.INFO,
  WARN: LogLevel.WARN,
  ERROR: LogLevel.ERROR,
  SILENT: LogLevel.SILENT,
};

/**
 * Default logger configuration
 */
export const DEFAULT_LOGGER_CONFIG: Required<LoggerOptions> = {
  level: LogLevel.INFO,
  enableColors: true,
  enableTimestamp: true,
  enableContext: true,
  format: 'text',
  transports: [],
};
