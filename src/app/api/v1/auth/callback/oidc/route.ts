
'use server';

import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify, createRemoteJWKSet } from 'jose';

function createErrorResponse(origin: string, error: string, description?: string): NextResponse {
  const loginUrl = new URL('/login', origin);
  const errorMessage = description || error;
  loginUrl.searchParams.set('error', errorMessage);
  
  console.error(`OIDC Callback Error: Redirecting to login. Reason: ${errorMessage}`);

  const response = NextResponse.redirect(loginUrl);
  
  // Ensure state cookie is always cleared on error
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
  const isSecure = new URL(request.url).protocol === 'https:';

  // --- Handle explicit errors from OIDC provider first ---
  if (errorParam) {
    return createErrorResponse(origin, errorParam, errorDescription || 'An error occurred during authentication.');
  }
  
  // --- Perform pre-flight checks before the try...catch block ---
  if (!state || !storedState || state !== storedState) {
    return createErrorResponse(origin, 'invalid_state', 'Your session has expired or is invalid. Please try signing in again.');
  }
  
  if (!code) {
    return createErrorResponse(origin, 'auth_code_missing', 'The authorization code was not found in the callback. Please try again.');
  }

  // --- Main token exchange logic ---
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
    
    // ** NEW: Verify the ID token on the server and extract claims **
    const JWKS = createRemoteJWKSet(new URL(wellknown.jwks_uri));
    const { payload } = await jwtVerify(tokens.id_token, JWKS, {
        issuer: wellknown.issuer,
        audience: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
    });

    // ** NEW: Create a smaller session object for the cookie **
    const sessionData = {
        claims: payload,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
    };

    const dashboardUrl = new URL('/', origin);
    const response = NextResponse.redirect(dashboardUrl);
    
    const maxAge = tokens.expires_in && typeof tokens.expires_in === 'number'
        ? tokens.expires_in
        : 3600;

    // Set auth cookie AND clear state cookie on the SAME response object before returning.
    response.cookies.set('auth_session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: isSecure,
      maxAge: maxAge,
      path: '/',
      sameSite: 'lax', // Use 'lax' for the main session cookie
    });
    
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
