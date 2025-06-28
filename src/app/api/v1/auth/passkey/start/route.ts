'use server';

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { pathnames } from '@/navigation';

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

    const wellknownUrl = process.env.NEXT_PUBLIC_COGNITO_WELLKNOWN;
    const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
    const appUrl = process.env.APP_URL?.replace(/\/$/, '');

    if (!wellknownUrl || !clientId) {
      throw new Error('SSO client configuration is missing.');
    }

    if (!appUrl) {
      throw new Error('Missing APP_URL env var.');
    }
    const callbackUrl = `${appUrl}/api/v1/auth/callback/passkey`;

    const wellknownResponse = await fetch(wellknownUrl, { cache: 'no-store' });
    if (!wellknownResponse.ok)
      throw new Error('Failed to fetch OpenID configuration');
    const wellknown = await wellknownResponse.json();
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
    console.error('Passkey start error:', error);
    const securityUrl = new URL(pathnames['/security'], request.url);
    securityUrl.searchParams.set('error', 'passkey_start_failed');
    securityUrl.searchParams.set(
      'error_description',
      error.message || 'Could not start the passkey setup process.'
    );
    return NextResponse.redirect(securityUrl);
  }
}
