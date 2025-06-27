'use server';

import { NextRequest, NextResponse } from 'next/server';
import { pathnames } from '@/navigation';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
        throw new Error('User is not authenticated. Cannot start passkey registration.');
    }

    const wellknownUrl = process.env.NEXT_PUBLIC_COGNITO_WELLKNOWN;
    const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
    const passkeyCallbackUrl = process.env.NEXT_PUBLIC_PASSKEY_CALLBACK_URL;
    const scope = 'openid email profile aws.cognito.signin.user.admin';

    if (!wellknownUrl || !clientId) {
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
    
    // --- CSRF protection ---
    const state = Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString('hex');
    
    // The access_token is crucial for Cognito to know which user is adding the passkey.
    // Some providers are sensitive to parameter order, so we construct the URL carefully.
    const params = new URLSearchParams({
        access_token: session.access_token,
        client_id: clientId,
        response_type: 'code',
        scope: scope,
        state: state,
    });

    // Manually append redirect_uri to ensure it is the last parameter.
    const passkeyUrlString = `${cognitoDomain}/passkeys/add?${params.toString()}&redirect_uri=${encodeURIComponent(passkeyCallbackUrl)}`;

    const response = NextResponse.redirect(passkeyUrlString);

    const isProd = process.env.NODE_ENV === 'production';

    // Set the cookie on the response that redirects the user
    response.cookies.set('oauth_state', state, {
      path: '/',
      maxAge: 600, // 10 minutes
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
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
