
'use server';

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { pathnames } from '@/navigation';

export async function GET(request: NextRequest) {
  try {
    // 1. Check for active session with a valid ID token
    const session = await getSession();
    if (!session?.id_token) {
      const loginUrl = new URL(pathnames['/login'], request.url);
      loginUrl.searchParams.set('error', 'authentication_required');
      loginUrl.searchParams.set('error_description', 'You must be logged in to add a passkey.');
      return NextResponse.redirect(loginUrl);
    }
    
    // 2. Get Cognito configuration
    const wellknownUrl = process.env.NEXT_PUBLIC_COGNITO_WELLKNOWN;
    const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
    const appUrl = process.env.APP_URL;
    const scope = 'openid email profile aws.cognito.signin.user.admin';

    if (!wellknownUrl || !clientId) {
      throw new Error('SSO client configuration is missing.');
    }
    
    if (!appUrl) {
      throw new Error('Missing APP_URL env var.');
    }
    const callbackUrl = `${appUrl}/api/v1/auth/callback/passkey`;

    const wellknownResponse = await fetch(wellknownUrl, { cache: 'no-store' });
    if (!wellknownResponse.ok) throw new Error('Failed to fetch OpenID configuration');
    const wellknown = await wellknownResponse.json();
    const authorizationEndpoint = wellknown.authorization_endpoint;
    
    // 3. CSRF protection
    const state = Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString('hex');
    
    const params = new URLSearchParams({
      client_id: clientId,
      response_type: 'code',
      scope: scope,
      redirect_uri: callbackUrl,
      state: state,
      id_token_hint: session.id_token, // Provide user context to Cognito
    });
  
    // 4. Redirect to Cognito's authorization endpoint
    const passkeySetupUrl = `${authorizationEndpoint}?${params.toString()}`;
    const response = NextResponse.redirect(passkeySetupUrl);
    
    const isProd = process.env.NODE_ENV === 'production';
    const appUrlObject = new URL(appUrl);
    const cookieDomain = isProd ? appUrlObject.hostname : undefined;

    // Set the state cookie for CSRF protection
    response.cookies.set('oauth_state', state, {
      path: '/',
      maxAge: 600, // 10 minutes
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      domain: cookieDomain,
    });

    return response;

  } catch (error: any) {
    console.error('Passkey start error:', error);
    // Redirect back to the security page with an error
    const securityUrl = new URL(pathnames['/security'], request.url);
    securityUrl.searchParams.set('error', 'passkey_start_failed');
    securityUrl.searchParams.set('error_description', error.message || 'Could not start the passkey setup process.');
    return NextResponse.redirect(securityUrl);
  }
}
