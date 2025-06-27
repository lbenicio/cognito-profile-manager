
'use server';

import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { pathnames } from '@/navigation';
import { cognitoClient, UpdateUserAttributesCommand } from '@/lib/cognito';

function createErrorResponse(origin: string, error: string, description?: string): NextResponse {
  const securityUrl = new URL(pathnames['/security'], origin);
  securityUrl.searchParams.set('error', error);
  if (description) {
    securityUrl.searchParams.set('error_description', description);
  }
  const response = NextResponse.redirect(securityUrl);
  response.cookies.set('oauth_state', '', { expires: new Date(0), path: '/' });
  return response;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get('code');
  const errorParam = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  const state = searchParams.get('state');
  const storedState = request.cookies.get('oauth_state')?.value;

  if (errorParam) {
    return createErrorResponse(origin, errorParam, errorDescription);
  }
  
  if (!state || !storedState || state !== storedState) {
    return createErrorResponse(origin, 'invalid_state', 'Your session has expired or is invalid. Please try again.');
  }

  if (!code) {
    return createErrorResponse(origin, 'auth_code_missing', 'The authorization code was not found in the callback.');
  }

  try {
    const wellknownUrl = process.env.NEXT_PUBLIC_COGNITO_WELLKNOWN;
    if (!wellknownUrl) throw new Error('Missing NEXT_PUBLIC_COGNITO_WELLKNOWN env var');
    
    const callbackUrl = process.env.NEXT_PUBLIC_PASSKEY_CALLBACK_URL;
    if (!callbackUrl) {
      throw new Error('Missing NEXT_PUBLIC_PASSKEY_CALLBACK_URL env var');
    }

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

    const headers: HeadersInit = { 'Content-Type': 'application/x-www-form-urlencoded' };
    const clientSecret = process.env.COGNITO_CLIENT_SECRET;
    if (clientSecret) {
      headers['Authorization'] = `Basic ${Buffer.from(`${process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!}:${clientSecret}`).toString('base64')}`;
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
      throw new Error(errorDetails);
    }
    
    const updateUserAttrCommand = new UpdateUserAttributesCommand({
        AccessToken: tokens.access_token,
        UserAttributes: [{
            Name: 'custom:pless',
            Value: 'true',
        }],
    });
    await cognitoClient.send(updateUserAttrCommand);

    const securityUrl = new URL(pathnames['/security'], origin);
    securityUrl.searchParams.set('result', 'success');
    const response = NextResponse.redirect(securityUrl);
    
    response.cookies.set('oauth_state', '', { expires: new Date(0), path: '/' });
    
    revalidatePath(pathnames['/security']);
    revalidatePath('/');
    
    return response;

  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    console.error('Passkey callback handler error:', e);
    return createErrorResponse(origin, 'passkey_update_failed', errorMessage);
  }
}
