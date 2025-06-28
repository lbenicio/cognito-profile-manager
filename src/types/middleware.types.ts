/**
 * Middleware types for Next.js middleware and custom middleware functions.
 */

import type { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware function type
 */
export type MiddlewareFunction = (
  request: NextRequest,
  response: NextResponse
) => NextResponse | Promise<NextResponse>;

/**
 * Middleware configuration
 */
export interface MiddlewareConfig {
  matcher?: string | string[];
  runtime?: 'edge' | 'nodejs';
}

/**
 * Authentication middleware context
 */
export interface AuthMiddlewareContext {
  isAuthenticated: boolean;
  user?: {
    sub: string;
    username: string;
    email: string;
    isAdmin: boolean;
  };
  session?: {
    sessionId: string;
    expiresAt: number;
  };
}

/**
 * Request context for middleware
 */
export interface RequestContext {
  requestId: string;
  timestamp: number;
  path: string;
  method: string;
  userAgent?: string;
  ip?: string;
  country?: string;
  locale?: string;
  headers: Record<string, string>;
}

/**
 * Security middleware options
 */
export interface SecurityMiddlewareOptions {
  enableCSP?: boolean;
  enableHSTS?: boolean;
  enableXFrameOptions?: boolean;
  enableRateLimiting?: boolean;
  rateLimitConfig?: {
    windowMs: number;
    max: number;
    skipSuccessfulRequests?: boolean;
  };
}

/**
 * CORS middleware options
 */
export interface CorsMiddlewareOptions {
  origin?: string | string[] | boolean;
  methods?: string[];
  allowedHeaders?: string[];
  credentials?: boolean;
  optionsSuccessStatus?: number;
}

/**
 * Logging middleware options
 */
export interface LoggingMiddlewareOptions {
  enableRequestLogging?: boolean;
  enableResponseLogging?: boolean;
  enableErrorLogging?: boolean;
  excludePaths?: string[];
  sensitiveHeaders?: string[];
  maxBodySize?: number;
}

/**
 * Internationalization middleware options
 */
export interface I18nMiddlewareOptions {
  locales: string[];
  defaultLocale: string;
  localeDetection?: boolean;
  localeCookie?: string;
  alternateLinks?: boolean;
}

/**
 * Redirect rule
 */
export interface RedirectRule {
  source: string;
  destination: string;
  permanent?: boolean;
  statusCode?: number;
  conditions?: {
    header?: Record<string, string>;
    query?: Record<string, string>;
    cookie?: Record<string, string>;
  };
}

/**
 * Rewrite rule
 */
export interface RewriteRule {
  source: string;
  destination: string;
  conditions?: {
    header?: Record<string, string>;
    query?: Record<string, string>;
    cookie?: Record<string, string>;
  };
}

/**
 * Route protection configuration
 */
export interface RouteProtection {
  path: string;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  allowedRoles?: string[];
  redirectTo?: string;
}

/**
 * Middleware chain configuration
 */
export interface MiddlewareChainConfig {
  auth?: boolean;
  security?: SecurityMiddlewareOptions;
  cors?: CorsMiddlewareOptions;
  logging?: LoggingMiddlewareOptions;
  i18n?: I18nMiddlewareOptions;
  redirects?: RedirectRule[];
  rewrites?: RewriteRule[];
  routeProtection?: RouteProtection[];
}

/**
 * Middleware response with context
 */
export interface MiddlewareResponse {
  response: NextResponse;
  context?: Record<string, unknown>;
  skipNext?: boolean;
}

/**
 * Error handling middleware context
 */
export interface ErrorMiddlewareContext {
  error: Error;
  request: NextRequest;
  response?: NextResponse;
  statusCode?: number;
}

/**
 * Rate limiting context
 */
export interface RateLimitContext {
  key: string;
  limit: number;
  windowMs: number;
  current: number;
  remaining: number;
  resetTime: number;
}

/**
 * Session middleware context
 */
export interface SessionMiddlewareContext {
  sessionId?: string;
  userId?: string;
  isValid: boolean;
  expiresAt?: number;
  data?: Record<string, unknown>;
}

/**
 * Middleware execution context
 */
export interface MiddlewareExecutionContext {
  request: NextRequest;
  auth?: AuthMiddlewareContext;
  session?: SessionMiddlewareContext;
  rateLimit?: RateLimitContext;
  security?: Record<string, unknown>;
  custom?: Record<string, unknown>;
}

/**
 * Middleware factory function type
 */
export type MiddlewareFactory<T = unknown> = (
  options?: T
) => MiddlewareFunction;

/**
 * Middleware composer type
 */
export type MiddlewareComposer = (
  ...middlewares: MiddlewareFunction[]
) => MiddlewareFunction;

/**
 * Conditional middleware type
 */
export type ConditionalMiddleware = (
  condition: (request: NextRequest) => boolean,
  middleware: MiddlewareFunction
) => MiddlewareFunction;

/**
 * Path matcher function type
 */
export type PathMatcher = (path: string) => boolean;

/**
 * Middleware priority levels
 */
export enum MiddlewarePriority {
  HIGHEST = 1,
  HIGH = 2,
  NORMAL = 3,
  LOW = 4,
  LOWEST = 5,
}

/**
 * Middleware registration info
 */
export interface MiddlewareRegistration {
  name: string;
  middleware: MiddlewareFunction;
  priority: MiddlewarePriority;
  enabled: boolean;
  conditions?: PathMatcher[];
}

/**
 * Custom header configuration
 */
export interface CustomHeaders {
  [key: string]: string;
}

/**
 * Cookie configuration for middleware
 */
export interface CookieConfig {
  name: string;
  value: string;
  options?: {
    maxAge?: number;
    expires?: Date;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
    domain?: string;
    path?: string;
  };
}

/**
 * Middleware metrics and monitoring
 */
export interface MiddlewareMetrics {
  requestCount: number;
  errorCount: number;
  averageResponseTime: number;
  lastExecuted: Date;
  totalExecutionTime: number;
}

/**
 * Feature flag middleware options
 */
export interface FeatureFlagMiddlewareOptions {
  flags: Record<string, boolean>;
  defaultValue?: boolean;
  source?: 'env' | 'database' | 'external';
}

/**
 * Common middleware patterns
 */
export const MIDDLEWARE_PATTERNS = {
  API_ROUTES: '/api/:path*',
  AUTH_ROUTES: '/(auth|login|register)/:path*',
  PROTECTED_ROUTES: '/(dashboard|profile|settings)/:path*',
  PUBLIC_ROUTES: '/(public|assets|_next)/:path*',
  ADMIN_ROUTES: '/admin/:path*',
} as const;

/**
 * Middleware execution order
 */
export const MIDDLEWARE_ORDER = [
  'security',
  'cors',
  'rateLimit',
  'auth',
  'session',
  'i18n',
  'logging',
  'custom',
] as const;

/**
 * Middleware execution order type
 */
export type MiddlewareOrderType = (typeof MIDDLEWARE_ORDER)[number];
