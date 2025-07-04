'use server';

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { pathnames } from '@/navigation';
import { Logger } from '@/lib/logger';
import { getWellKnownConfig } from '@/lib/well-known';
import { getCognitoCallbackUrl } from '@/lib/url';

const logger = new Logger('PASSKEY-START');

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.accessToken) {
      const loginUrl = new URL(pathnames['/login'], request.url);
      loginUrl.searchParams.set('error', 'authentication_required');
      loginUrl.searchParams.set(
        'error_description',
        'You must be logged in to add a passkey.'
      );
      return NextResponse.redirect(loginUrl);
    }

    const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;

    if (!clientId) {
      throw new Error('SSO client configuration is missing.');
    }

    const callbackUrl = await getCognitoCallbackUrl(
      '/api/v1/auth/callback/passkey'
    );

    const wellknown = await getWellKnownConfig();
    const authorizationEndpoint = wellknown.authorization_endpoint;

    const params = new URLSearchParams({
      client_id: clientId,
      scope: 'openid',
      redirect_uri: callbackUrl,
    });

    const passkeySetupUrl = `${authorizationEndpoint}?${params.toString()}`;
    const response = NextResponse.redirect(passkeySetupUrl);
    response.headers.set('Authorization', `Bearer ${session.accessToken}`);

    return response;
  } catch (error: any) {
    logger.error('Passkey start error:', error);
    const securityUrl = new URL(pathnames['/security'], request.url);
    securityUrl.searchParams.set('error', 'passkey_start_failed');
    securityUrl.searchParams.set(
      'error_description',
      error.message || 'Could not start the passkey setup process.'
    );
    return NextResponse.redirect(securityUrl);
  }
}
