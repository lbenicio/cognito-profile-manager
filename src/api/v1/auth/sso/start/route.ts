
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const wellknownUrl = process.env.NEXT_PUBLIC_COGNITO_WELLKNOWN;
    const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
    const appUrl = process.env.APP_URL?.replace(/\/$/, ''); // Remove trailing slash
    const scope = process.env.NEXT_PUBLIC_OAUTH2_SCOPE || 'openid profile email aws.cognito.signin.user.admin';

    if (!wellknownUrl || !clientId || !appUrl) {
      throw new Error('Application authentication configuration is incomplete.');
    }
    
    const callbackUrl = `${appUrl}/api/v1/auth/callback/oidc`;

    const wellknownResponse = await fetch(wellknownUrl, { cache: 'no-store' });
    if (!wellknownResponse.ok) {
      throw new Error('Failed to fetch OpenID configuration from provider.');
    }
    const wellknown = await wellknownResponse.json();
    const authorizationEndpoint = wellknown.authorization_endpoint;

    if (!authorizationEndpoint) {
        throw new Error('Authorization endpoint not found in OpenID configuration.');
    }
    
    // --- CSRF protection ---
    const state = Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString('hex');
    
    const params = new URLSearchParams({
      client_id: clientId,
      response_type: 'code',
      scope: scope,
      redirect_uri: callbackUrl,
      state: state,
    });
  
    const loginUrl = `${authorizationEndpoint}?${params.toString()}`;

    const response = NextResponse.redirect(loginUrl);
    
    const isProd = process.env.NODE_ENV === 'production';
    
    let cookieDomain: string | undefined;
    if (isProd && appUrl) {
        const hostname = new URL(appUrl).hostname;
        // Set domain to the base domain (e.g., example.com for www.example.com)
        cookieDomain = hostname.startsWith('www.') ? hostname.substring(4) : hostname;
    }

    // Set the state cookie for CSRF protection
    response.cookies.set('oauth_state', state, {
      path: '/',
      maxAge: 600, // 10 minutes
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax', // 'none' requires secure: true
      domain: cookieDomain,
    });

    return response;

  } catch (error: any) {
    console.error('SSO start error:', error);
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('error', 'sso_start_failed');
    loginUrl.searchParams.set('error_description', error.message || 'Could not start the SSO process.');
    return NextResponse.redirect(loginUrl);
  }
}
