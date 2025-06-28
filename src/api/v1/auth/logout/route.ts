
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // This route handles logging the user out from both the application and the OIDC provider.
  const appUrl = process.env.APP_URL?.replace(/\/$/, '');
  const loginUrl = new URL('/login', request.url);

  // 1. Build the full OIDC logout URL
  let cognitoLogoutUrl = loginUrl.toString(); // Default fallback
  try {
    const wellknownUrl = process.env.NEXT_PUBLIC_COGNITO_WELLKNOWN;
    const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;

    if (!wellknownUrl || !clientId || !appUrl) {
      throw new Error('Logout configuration is missing in environment variables.');
    }

    const wellknownResponse = await fetch(wellknownUrl, { cache: 'no-store' });
    if (!wellknownResponse.ok) throw new Error('Failed to fetch OpenID configuration.');
    
    const wellknown = await wellknownResponse.json();
    const logoutEndpoint = wellknown.logout_endpoint || wellknown.end_session_endpoint;

    if (!logoutEndpoint) {
      throw new Error('Logout endpoint not found in OpenID configuration.');
    }
    
    const url = new URL(logoutEndpoint);
    url.searchParams.set('client_id', clientId);
    url.searchParams.set('logout_uri', `${appUrl}/login`);
    url.searchParams.set('response_type', 'code'); // Recommended for some OIDC providers
    cognitoLogoutUrl = url.toString();

  } catch (error) {
    console.error('OIDC logout URL construction failed, will redirect to local login page.', error);
  }

  // 2. Create the redirect response to the OIDC provider's logout URL
  const response = NextResponse.redirect(cognitoLogoutUrl);

  // 3. Clear all session-related cookies on the response
  const isProd = process.env.NODE_ENV === 'production';
  let cookieDomain: string | undefined;
  if (isProd && appUrl) {
      const hostname = new URL(appUrl).hostname;
      cookieDomain = hostname.startsWith('www.') ? hostname.substring(4) : hostname;
  }

  response.cookies.set('auth_session', '', { 
      expires: new Date(0), 
      path: '/',
      domain: cookieDomain
  });
  response.cookies.set('oauth_state', '', { 
      expires: new Date(0), 
      path: '/',
      domain: cookieDomain
  });

  // 4. Return the response that redirects the user and clears cookies
  return response;
}
