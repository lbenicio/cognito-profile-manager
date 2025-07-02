import 'server-only';
import { headers } from 'next/headers';

/**
 * Dynamically gets the base URL from the request headers, which is crucial for
 * server-side rendering and API routes in a proxied environment.
 * @returns The full base URL of the application.
 */
export function getBaseUrl(): string {
  const headersList = headers();
  const forwardedHost = headersList.get('x-forwarded-host');
  const forwardedProto = headersList.get('x-forwarded-proto');
  const isHttps =
    forwardedProto === 'https' || process.env.NO_HTTPS !== 'true';
  const protocol = isHttps ? 'https' : 'http';

  // In a local environment, 'host' is preferred. In a proxied environment (like Vercel),
  // 'x-forwarded-host' is the source of truth.
  const host = forwardedHost || headersList.get('host');

  if (!host) {
    // Fallback for environments where host headers are not available (e.g., some CI/CD)
    return process.env.APP_URL || 'http://localhost:3000';
  }

  return `${protocol}://${host}`;
}

/**
 * Gets the specific callback URL for Cognito, ensuring it uses HTTPS unless
 * explicitly disabled for local development. Cognito is very strict about this.
 * @returns The full callback URL for Cognito.
 */
export function getCognitoCallbackUrl(path: string): string {
  const headersList = headers();
  const forwardedHost = headersList.get('x-forwarded-host');
  const host = forwardedHost || headersList.get('host');

  if (!host) {
    return `${process.env.APP_URL}${path}`;
  }

  // Always use HTTPS for Cognito callbacks unless NO_HTTPS is explicitly true
  const protocol = process.env.NO_HTTPS === 'true' ? 'http' : 'https';
  return `${protocol}://${host}${path}`;
}
