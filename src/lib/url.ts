'use server';
import 'server-only';
import { headers } from 'next/headers';

/**
 * Dynamically constructs the application's base URL from request headers.
 * Essential for server-side rendering in proxied environments.
 * It respects x-forwarded-host and x-forwarded-proto headers.
 *
 * @returns The full base URL (e.g., "https://example.com").
 */
export function getBaseUrl() {
  const headersList = headers();
  const forwardedHost = headersList.get('x-forwarded-host');
  const host = forwardedHost || headersList.get('host');

  if (!host) {
    // Fallback for environments where host headers might not be available (e.g., CI/CD).
    return process.env.APP_URL || 'http://localhost:3000';
  }

  const forwardedProto = headersList.get('x-forwarded-proto');
  const protocol =
    forwardedProto || (process.env.NO_HTTPS === 'true' ? 'http' : 'https');
  return `${protocol}://${host}`;
}

/**
 * Constructs the specific callback URL for Cognito, ensuring it uses HTTPS
 * unless explicitly disabled for local development via the NO_HTTPS env var.
 * Cognito is very strict about matching this URL exactly.
 *
 * @param path - The API path for the callback (e.g., /api/v1/auth/callback/oidc).
 * @returns The full, correctly formatted callback URL for Cognito.
 */
export function getCognitoCallbackUrl(path: string): string {
  const headersList = headers();
  const forwardedHost = headersList.get('x-forwarded-host');
  const host = forwardedHost || headersList.get('host');

  if (!host) {
    // Fallback to APP_URL if headers are not available.
    const baseUrl = new URL(process.env.APP_URL || 'http://localhost:3000');
    baseUrl.pathname = path;
    if (process.env.NO_HTTPS !== 'true') {
      baseUrl.protocol = 'https:';
    }
    return baseUrl.toString();
  }

  // Always use HTTPS for Cognito callbacks unless NO_HTTPS is explicitly true.
  const protocol = process.env.NO_HTTPS === 'true' ? 'http' : 'https';
  return `${protocol}://${host}${path}`;
}
