'use server';

import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify, createRemoteJWKSet } from 'jose';
import type { JWTPayload } from 'jose';
import { createSession } from '@/lib/session';

function createErrorResponse(origin: string, error: string, description?: string): NextResponse {
  const loginUrl = new URL('/login', origin);
  const errorMessage = description || error;
  loginUrl.searchParams.set('error', errorMessage);
  
  console.error(`OIDC Callback Error: Redirecting to login. Reason: ${errorMessage}`);

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
    return createErrorResponse(origin, errorParam, errorDescription || 'An error occurred during authentication.');
  }
  
  if (!state || !storedState || state !== storedState) {
    return createErrorResponse(origin, 'invalid_state', 'Your session has expired or is invalid. Please try signing in again.');
  }
  
  if (!code) {
    return createErrorResponse(origin, 'auth_code_missing', 'The authorization code was not found in the callback. Please try again.');
  }

  try {
    const wellknownUrl = process.env.NEXT_PUBLIC_COGNITO_WELLKNOWN;
    if (!wellknownUrl) throw new Error('Missing NEXT_PUBLIC_COGNITO_WELLKNOWN env var');

    const appUrl = process.env.APP_URL?.replace(/\/$/, '');
    if (!appUrl) {
      throw new Error('Missing APP_URL env var');
    }
    const callbackUrl = `${appUrl}/api/v1/auth/callback/oidc`;

    const wellknownResponse = await fetch(wellknownUrl, { cache: 'no-store' });
    if (!wellknownResponse.ok) throw new Error('Failed to fetch OpenID configuration from provider.');
    const wellknown = await wellknownResponse.json();
    
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
      const errorDetails = tokens.error_description || tokens.error || "Token exchange failed.";
      console.error(`Token exchange failed with Cognito. Status: ${tokenResponse.status}. Details: ${errorDetails}. Check if the redirect_uri in your Cognito App Client settings matches: ${callbackUrl}`);
      throw new Error(errorDetails);
    }
    
    const JWKS = createRemoteJWKSet(new URL(wellknown.jwks_uri));
    const { payload }: { payload: JWTPayload } = await jwtVerify(tokens.id_token, JWKS, {
        issuer: wellknown.issuer,
        audience: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
    });

    // Create a single encrypted session
    const sessionData = {
        claims: payload,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
    };
    const expiresIn = tokens.expires_in && typeof tokens.expires_in === 'number' ? tokens.expires_in : 3600;
    await createSession(sessionData, expiresIn);

    // Clear the state cookie on the SAME response object before returning.
    const dashboardUrl = new URL('/', origin);
    const response = NextResponse.redirect(dashboardUrl);
    response.cookies.set('oauth_state', '', { 
        expires: new Date(0), 
        path: '/',
    });

    return response;

  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred during the login process.';
    console.error(`Caught error in OIDC callback: ${errorMessage}`);
    return createErrorResponse(origin, 'callback_error', errorMessage);
  }
}
