import { NextRequest, NextResponse } from 'next/server';
import { deleteSession } from '@/lib/session';
import { Logger } from '@/lib/logger';

const logger = new Logger('LOGOUT');

export async function GET(request: NextRequest) {
  const appUrl = process.env.APP_URL?.replace(/\/$/, '');
  const loginUrl = new URL('/login', request.url);

  // 1. Clear the local session cookie
  await deleteSession();

  // 2. Build the full OIDC logout URL
  let cognitoLogoutUrl = loginUrl.toString(); // Default fallback
  try {
    const wellknownUrl = process.env.NEXT_PUBLIC_COGNITO_WELLKNOWN;
    const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;

    if (!wellknownUrl || !clientId || !appUrl) {
      throw new Error(
        'Logout configuration is missing in environment variables.'
      );
    }

    const wellknownResponse = await fetch(wellknownUrl, { cache: 'no-store' });
    if (!wellknownResponse.ok)
      throw new Error('Failed to fetch OpenID configuration.');

    const wellknown = await wellknownResponse.json();
    const logoutEndpoint =
      wellknown.logout_endpoint || wellknown.end_session_endpoint;

    if (!logoutEndpoint) {
      throw new Error('Logout endpoint not found in OpenID configuration.');
    }

    const url = new URL(logoutEndpoint);
    url.searchParams.set('client_id', clientId);
    url.searchParams.set('logout_uri', `${appUrl}/login`);
    url.searchParams.set('response_type', 'code');
    cognitoLogoutUrl = url.toString();
  } catch (error) {
    logger.error(
      'OIDC logout URL construction failed, will redirect to local login page.',
      error
    );
  }

  // 3. Create the redirect response to the OIDC provider's logout URL
  const response = NextResponse.redirect(cognitoLogoutUrl);

  // 4. Ensure any other auth-related cookies are also cleared
  response.cookies.set('oauth_state', '', { expires: new Date(0), path: '/' });

  return response;
}
