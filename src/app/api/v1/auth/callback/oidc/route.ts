import { NextRequest, NextResponse } from 'next/server';

// Helper to construct login URL with an error message from a reliable base URL
const getLoginUrlWithError = (errorMessage: string, request: NextRequest) => {
  // Prefer the publicly configured URL's origin, but fall back to the request's origin.
  // This handles cases where the env var might be missing when an error is thrown.
  const baseUrl = process.env.NEXT_PUBLIC_OAUTH2_CALLBACK_URL
    ? new URL(process.env.NEXT_PUBLIC_OAUTH2_CALLBACK_URL).origin
    : request.nextUrl.origin;
  
  const loginUrl = new URL('/login', baseUrl);
  loginUrl.searchParams.set('error', errorMessage);
  return loginUrl;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');

  if (!code) {
    console.error('Authorization code missing from callback.');
    return NextResponse.redirect(getLoginUrlWithError('auth_code_missing', request));
  }

  try {
    const wellknownUrl = process.env.NEXT_PUBLIC_COGNITO_WELLKNOWN;
    if (!wellknownUrl) throw new Error('Missing NEXT_PUBLIC_COGNITO_WELLKNOWN env var');

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
      redirect_uri: callbackUrl,
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

    const sessionData = {
        id_token: tokens.id_token,
        access_token: tokens.access_token,
        expires_in: tokens.expires_in,
    };

    // Construct the redirect URL using the configured public callback URL's origin.
    // This ensures that the redirect and the cookie domain are always consistent.
    const dashboardUrl = new URL('/', callbackUrl);
    
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
    return NextResponse.redirect(getLoginUrlWithError(errorMessage, request));
  }
}
