'use server';

import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify, createRemoteJWKSet } from 'jose';
import type { AuthTokenPayload } from '@/interfaces/auth/auth.interfaces';
import { createSession } from '@/lib/session';
import { Logger } from '@/lib/logger';
import { getWellKnownConfig } from '@/lib/well-known';
import { getCognitoCallbackUrl } from '@/lib/url';

const logger = new Logger('OIDC-CALLBACK');

function createErrorResponse(
  origin: string,
  error: string,
  description?: string
): NextResponse {
  const loginUrl = new URL('/login', origin);
  const errorMessage = description || error;
  loginUrl.searchParams.set('error', errorMessage);

  logger.error(
    `OIDC Callback Error: Redirecting to login. Reason: ${errorMessage}`
  );

  const response = NextResponse.redirect(loginUrl);

  response.cookies.set('oauth_state', '', {
    expires: new Date(0),
    path: '/',
  });
  return response;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const errorParam = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  const state = searchParams.get('state');
  const storedState = request.cookies.get('oauth_state')?.value;

  if (errorParam) {
    return createErrorResponse(
      origin,
      errorParam,
      errorDescription || 'An error occurred during authentication.'
    );
  }

  if (!state || !storedState || state !== storedState) {
    return createErrorResponse(
      origin,
      'invalid_state',
      'Your session has expired or is invalid. Please try signing in again.'
    );
  }

  if (!code) {
    return createErrorResponse(
      origin,
      'auth_code_missing',
      'The authorization code was not found in the callback. Please try again.'
    );
  }

  try {
    const callbackUrl = getCognitoCallbackUrl('/api/v1/auth/callback/oidc');

    const wellknown = await getWellKnownConfig();
    const tokenEndpoint = wellknown.token_endpoint;

    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: callbackUrl,
      client_id: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
    });

    const headers: HeadersInit = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    const clientSecret = process.env.COGNITO_CLIENT_SECRET;

    if (clientSecret) {
      headers['Authorization'] = `Basic ${Buffer.from(
        `${process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!}:${clientSecret}`
      ).toString('base64')}`;
    }

    const tokenResponse = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: headers,
      body: params.toString(),
      cache: 'no-store',
    });

    const tokens = await tokenResponse.json();

    if (!tokenResponse.ok) {
      const errorDetails =
        tokens.error_description || tokens.error || 'Token exchange failed.';
      logger.error(
        `Token exchange failed with Cognito. Status: ${tokenResponse.status}. Details: ${errorDetails}. Check if the redirect_uri in your Cognito App Client settings matches: ${callbackUrl}`
      );
      throw new Error(errorDetails);
    }

    const JWKS = createRemoteJWKSet(new URL(wellknown.jwks_uri));
    const { payload } = await jwtVerify(tokens.id_token, JWKS, {
      issuer: wellknown.issuer,
      audience: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
    });

    // Store the full token set in Redis, identified by a new session ID
    const sessionData = {
      claims: payload as AuthTokenPayload,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
    };

    // The new createSession uses a long-lived duration internally.
    await createSession(sessionData);

    // Clear the state cookie on the SAME response object before returning.
    const dashboardUrl = new URL('/', origin);
    const response = NextResponse.redirect(dashboardUrl);
    response.cookies.set('oauth_state', '', {
      expires: new Date(0),
      path: '/',
    });

    return response;
  } catch (e) {
    const errorMessage =
      e instanceof Error
        ? e.message
        : 'An unknown error occurred during the login process.';
    logger.error(`Caught error in OIDC callback: ${errorMessage}`);
    return createErrorResponse(origin, 'callback_error', errorMessage);
  }
}
