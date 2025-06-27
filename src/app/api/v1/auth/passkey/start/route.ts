'use server';

import { NextRequest, NextResponse } from 'next/server';
import { pathnames } from '@/navigation';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.access_token) {
        throw new Error('User is not authenticated. Cannot start passkey registration.');
    }

    const wellknownUrl = process.env.NEXT_PUBLIC_COGNITO_WELLKNOWN;
    const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
    const scope = process.env.NEXT_PUBLIC_OAUTH2_SCOPE;
    const passkeyCallbackUrl = process.env.NEXT_PUBLIC_PASSKEY_CALLBACK_URL;

    if (!wellknownUrl || !clientId || !scope) {
      throw new Error('Passkey client configuration is missing.');
    }
    
    if (!passkeyCallbackUrl) {
      throw new Error('Missing NEXT_PUBLIC_PASSKEY_CALLBACK_URL env var.');
    }

    const wellknownResponse = await fetch(wellknownUrl, { cache: 'no-store' });
    if (!wellknownResponse.ok) throw new Error('Failed to fetch OpenID configuration');
    const wellknown = await wellknownResponse.json();
    const authorizationEndpoint = wellknown.authorization_endpoint;

    const cognitoDomain = new URL(authorizationEndpoint).origin;
    const passkeyUrl = new URL(`${cognitoDomain}/passkeys/add`);
    
    // --- CSRF protection ---
    const state = Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString('hex');
    
    // The access_token is crucial for Cognito to know which user is adding the passkey.
    passkeyUrl.searchParams.set('access_token', session.access_token);
    passkeyUrl.searchParams.set('client_id', clientId);
    passkeyUrl.searchParams.set('response_type', 'code');
    passkeyUrl.searchParams.set('scope', scope);
    passkeyUrl.searchParams.set('state', state);
    passkeyUrl.searchParams.set('redirect_uri', passkeyCallbackUrl);

    const response = NextResponse.redirect(passkeyUrl.toString());

    // Set the cookie on the response that redirects the user
    response.cookies.set('oauth_state', state, {
      path: '/',
      maxAge: 600, // 10 minutes
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return response;

  } catch (error: any) {
    console.error('Passkey start error:', error);
    const securityUrl = new URL(pathnames['/security'], request.url);
    securityUrl.searchParams.set('error', 'passkey_start_failed');
    securityUrl.searchParams.set('error_description', error.message || 'Could not start the passkey process.');
    return NextResponse.redirect(securityUrl);
  }
}
