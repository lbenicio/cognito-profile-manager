import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  // Helper to construct login URL with an error message from a reliable base URL
  const getLoginUrlWithError = (errorMessage: string) => {
    // Use the request's origin for error redirects to ensure consistency
    const loginUrl = new URL('/login', request.nextUrl.origin);
    loginUrl.searchParams.set('error', errorMessage);
    return loginUrl;
  }

  if (!code) {
    console.error('Authorization code missing from callback.');
    return NextResponse.redirect(getLoginUrlWithError('auth_code_missing'));
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

    if (process.env.COGNITO_CLIENT_SECRET) {
      params.append('client_secret', process.env.COGNITO_CLIENT_SECRET);
    }

    const tokenResponse = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
      cache: 'no-store',
    });

    const tokens = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error("Failed to exchange code for tokens. Response:", tokens);
      const errorDetails = tokens.error_description || tokens.error || "Unknown token exchange error";
      throw new Error(`Token exchange failed: ${errorDetails}`);
    }

    // Construct the redirect URL using the request's origin for maximum reliability.
    const dashboardUrl = new URL('/', request.nextUrl.origin);
    
    // Create the redirect response *first*
    const response = NextResponse.redirect(dashboardUrl);

    // Now, set the cookie on that specific response object
    response.cookies.set('auth_session', JSON.stringify(tokens), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: tokens.expires_in || 3600,
      path: '/',
      sameSite: 'lax',
    });
    
    return response;

  } catch (error) {
    console.error('Callback handler error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.redirect(getLoginUrlWithError(errorMessage));
  }
}
