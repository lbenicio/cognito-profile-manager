import { NextRequest, NextResponse } from 'next/server';
import { Logger } from '@/lib/logger';
import { getWellKnownConfig } from '@/lib/well-known';
import { getCognitoCallbackUrl } from '@/lib/url';

const logger = new Logger('SSO-START');

export async function GET(request: NextRequest) {
  try {
    const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
    const scope =
      process.env.NEXT_PUBLIC_OAUTH2_SCOPE ||
      'openid email profile aws.cognito.signin.user.admin';

    if (!clientId) {
      throw new Error(
        'NEXT_PUBLIC_COGNITO_CLIENT_ID environment variable is required.'
      );
    }

    const callbackUrl = await getCognitoCallbackUrl(
      '/api/v1/auth/callback/oidc'
    );

    const wellknown = await getWellKnownConfig();
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
  } catch (error) {
    logger.error('SSO start error:', error);
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('error', 'sso_start_failed');
    loginUrl.searchParams.set(
      'error_description',
      error instanceof Error
        ? error.message
        : 'Could not start the SSO process. Please check your OAuth2 configuration.'
    );
    return NextResponse.redirect(loginUrl);
  }
}
