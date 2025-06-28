
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Clear local cookies first, regardless of what happens next.
  const response = NextResponse.next(); // Start with a response object to modify

  const isProd = process.env.NODE_ENV === 'production';
  const appUrl = process.env.APP_URL?.replace(/\/$/, '');
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

  // Now, try to perform a full OIDC logout by redirecting the user.
  try {
    const wellknownUrl = process.env.NEXT_PUBLIC_COGNITO_WELLKNOWN;
    const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;

    if (!wellknownUrl || !clientId || !appUrl) {
      throw new Error('Logout configuration is missing.');
    }

    const wellknownResponse = await fetch(wellknownUrl, { cache: 'no-store' });
    if (!wellknownResponse.ok) throw new Error('Failed to fetch OpenID configuration.');
    
    const wellknown = await wellknownResponse.json();
    const logoutEndpoint = wellknown.logout_endpoint || wellknown.end_session_endpoint;

    if (!logoutEndpoint) {
      throw new Error('Logout endpoint not found in OpenID configuration.');
    }
    
    const logoutUrl = new URL(logoutEndpoint);
    logoutUrl.searchParams.set('client_id', clientId);
    logoutUrl.searchParams.set('logout_uri', `${appUrl}/login`);

    // Redirect the user's browser to the Cognito logout page
    return NextResponse.redirect(logoutUrl.toString(), {
      headers: response.headers, // Carry over the cookie-clearing headers
    });

  } catch (error) {
    console.error('OIDC logout failed:', error);
    // If the OIDC logout fails, we still want to redirect to the login page
    // with the local session cleared.
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl, {
        headers: response.headers, // Carry over the cookie-clearing headers
    });
  }
}
