import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const requestUrl = new URL(request.url); // Use the incoming request URL as the base for redirects

  if (!code) {
    console.error('Authorization code missing from callback.');
    const loginUrl = new URL('/login', requestUrl.origin);
    loginUrl.searchParams.set('error', 'auth_code_missing');
    return NextResponse.redirect(loginUrl);
  }

  try {
    const wellknownUrl = process.env.NEXT_PUBLIC_COGNITO_WELLKNOWN;
    if (!wellknownUrl) throw new Error('Missing NEXT_PUBLIC_COGNITO_WELLKNOWN env var');

    // This URL is for the server-to-server call and MUST match Cognito config.
    const callbackUrl = process.env.NEXT_PUBLIC_OAUTH2_CALLBACK_URL;
    if (!callbackUrl) {
      throw new Error('Missing NEXT_PUBLIC_OAUTH2_CALLBACK_URL env var');
    }

    const wellknownResponse = await fetch(wellknownUrl, { cache: 'no-store' });
    if (!wellknownResponse.ok) throw new Error('Failed to fetch OpenID configuration');
    const wellknown = await wellknownResponse.json();
    
    const tokenEndpoint = wellknown.token_endpoint;

    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: callbackUrl, // Use the configured URL for the API call
      client_id: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
    });

    const headers: HeadersInit = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };
    
    const clientSecret = process.env.COGNITO_CLIENT_SECRET;
    
    if (clientSecret) {
      // For confidential clients, use Basic Auth.
      headers['Authorization'] = `Basic ${Buffer.from(
        `${process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!}:${clientSecret}`
      ).toString('base64')}`;
    }

    const tokenResponse = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: headers,
      body: params.toString(),
      cache: 'no-store',
    });

    const tokens = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error("Failed to exchange code for tokens. Response:", tokens);
      const errorDetails = tokens.error_description || tokens.error || "Unknown token exchange error";
      throw new Error(`Token exchange failed: ${errorDetails}`);
    }

    const sessionData = {
        id_token: tokens.id_token,
        access_token: tokens.access_token,
        expires_in: tokens.expires_in,
    };

    // For the user-facing redirect, use the origin of the request they made.
    const dashboardUrl = new URL('/', requestUrl.origin);
    
    const response = NextResponse.redirect(dashboardUrl);

    response.cookies.set('auth_session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionData.expires_in || 3600,
      path: '/',
      sameSite: 'lax',
    });
    
    return response;

  } catch (error) {
    console.error('Callback handler error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    
    const loginUrl = new URL('/login', requestUrl.origin);
    loginUrl.searchParams.set('error', errorMessage);
    return NextResponse.redirect(loginUrl);
  }
}
