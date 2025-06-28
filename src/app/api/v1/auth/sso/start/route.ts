import { NextRequest, NextResponse } from 'next/server';
import { Logger } from '@/lib/logger';

const logger = new Logger('SSO-START');

export async function GET(request: NextRequest) {
  try {
    const wellknownUrl = process.env.NEXT_PUBLIC_COGNITO_WELLKNOWN;
    const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
    const appUrl = process.env.APP_URL?.replace(/\/$/, '');
    const scope = 'openid email profile aws.cognito.signin.user.admin';

    if (!wellknownUrl || !clientId) {
      throw new Error('SSO client configuration is missing.');
    }

    if (!appUrl) {
      throw new Error('Missing APP_URL env var.');
    }
    const callbackUrl = `${appUrl}/api/v1/auth/callback/oidc`;

    const wellknownResponse = await fetch(wellknownUrl, { cache: 'no-store' });
    if (!wellknownResponse.ok)
      throw new Error('Failed to fetch OpenID configuration');
    const wellknown = await wellknownResponse.json();
    const authorizationEndpoint = wellknown.authorization_endpoint;

    // --- CSRF protection ---
    const state = Buffer.from(
      crypto.getRandomValues(new Uint8Array(16))
    ).toString('hex');

    const params = new URLSearchParams({
      client_id: clientId,
      response_type: 'code',
      scope: scope,
      redirect_uri: callbackUrl,
      state: state,
    });

    const loginUrl = `${authorizationEndpoint}?${params.toString()}`;

    const response = NextResponse.redirect(loginUrl);

    const isSecure = new URL(request.url).protocol === 'https:';

    // Set the cookie on the response that redirects the user
    response.cookies.set('oauth_state', state, {
      path: '/',
      maxAge: 600, // 10 minutes
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
    });

    return response;
  } catch (error: any) {
    logger.error('SSO start error:', error);
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('error', 'sso_start_failed');
    loginUrl.searchParams.set(
      'error_description',
      error.message || 'Could not start the SSO process.'
    );
    return NextResponse.redirect(loginUrl);
  }
}
