import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  if (!code) {
    console.error('Authorization code missing from callback.');
    return NextResponse.redirect(new URL('/login?error=auth_code_missing', request.url));
  }

  try {
    const wellknownUrl = process.env.NEXT_PUBLIC_COGNITO_WELLKNOWN;
    if (!wellknownUrl) throw new Error('Missing NEXT_PUBLIC_COGNITO_WELLKNOWN env var');

    const wellknownResponse = await fetch(wellknownUrl, { cache: 'no-store' });
    if (!wellknownResponse.ok) throw new Error('Failed to fetch OpenID configuration');
    const wellknown = await wellknownResponse.json();
    
    const tokenEndpoint = wellknown.token_endpoint;

    if (!process.env.NEXT_PUBLIC_OAUTH2_CALLBACK_URL) {
      throw new Error('Missing NEXT_PUBLIC_OAUTH2_CALLBACK_URL env var');
    }

    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: process.env.NEXT_PUBLIC_OAUTH2_CALLBACK_URL,
      client_id: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
    });

    // Conditionally add client_secret if it exists.
    // This supports both public (no secret) and confidential (with secret) Cognito app clients.
    if (process.env.COGNITO_CLIENT_SECRET) {
      params.append('client_secret', process.env.COGNITO_CLIENT_SECRET);
    }

    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
      cache: 'no-store',
    });

    const tokens = await response.json();

    if (!response.ok) {
      console.error("Failed to exchange code for tokens. Response:", tokens);
      const errorDetails = tokens.error_description || tokens.error || "Unknown token exchange error";
      throw new Error(`Token exchange failed: ${errorDetails}`);
    }

    // Set tokens in a secure, httpOnly cookie
    cookies().set('auth_session', JSON.stringify(tokens), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: tokens.expires_in || 3600, // Use token lifetime, default to 1 hour
      path: '/',
      sameSite: 'lax',
    });
    
    // Redirect to the dashboard by constructing the URL from the known callback URL origin.
    // This is more reliable than using request.url, which can be inconsistent in some proxy/cloud environments.
    const redirectUrl = new URL(process.env.NEXT_PUBLIC_OAUTH2_CALLBACK_URL);
    const dashboardUrl = new URL('/', redirectUrl.origin);
    
    return NextResponse.redirect(dashboardUrl);

  } catch (error) {
    console.error('Callback handler error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    
    // Construct the login URL from the configured redirect origin to ensure consistency
    const redirectUrl = new URL(process.env.NEXT_PUBLIC_OAUTH2_CALLBACK_URL || request.url);
    const loginUrl = new URL('/login', redirectUrl.origin);
    loginUrl.searchParams.set('error', errorMessage);

    return NextResponse.redirect(loginUrl);
  }
}
