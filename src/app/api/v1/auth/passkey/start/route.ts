import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const wellknownUrl = process.env.NEXT_PUBLIC_COGNITO_WELLKNOWN;
    const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
    const scope = process.env.NEXT_PUBLIC_OAUTH2_SCOPE;
    const passkeyCallbackUrl = process.env.NEXT_PUBLIC_PASSKEY_CALLBACK_URL;

    if (!wellknownUrl || !clientId || !scope) {
      throw new Error('Passkey client configuration is missing.');
    }
    
    if (!passkeyCallbackUrl) {
      throw new Error('Missing NEXT_PUBLIC_PASSKEY_CALLBACK_URL env var.');
    }

    const wellknownResponse = await fetch(wellknownUrl, { cache: 'no-store' });
    if (!wellknownResponse.ok) throw new Error('Failed to fetch OpenID configuration');
    const wellknown = await wellknownResponse.json();
    const authorizationEndpoint = wellknown.authorization_endpoint;

    const cognitoDomain = new URL(authorizationEndpoint).origin;
    const passkeyUrl = new URL(`${cognitoDomain}/passkeys/add`);
    
    // --- CSRF protection ---
    const state = Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString('hex');
    
    passkeyUrl.searchParams.set('client_id', clientId);
    passkeyUrl.searchParams.set('response_type', 'code');
    passkeyUrl.searchParams.set('scope', scope);
    passkeyUrl.searchParams.set('redirect_uri', passkeyCallbackUrl);
    passkeyUrl.searchParams.set('state', state);

    const response = NextResponse.redirect(passkeyUrl.toString());

    // Set the cookie on the response that redirects the user
    response.cookies.set('oauth_state', state, {
      path: '/',
      maxAge: 600, // 10 minutes
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Use 'lax' for better compatibility with OIDC redirects.
    });

    return response;

  } catch (error: any) {
    console.error('Passkey start error:', error);
    const accountUrl = new URL('/account', request.url);
    accountUrl.searchParams.set('error', 'passkey_start_failed');
    accountUrl.searchParams.set('error_description', error.message || 'Could not start the passkey process.');
    return NextResponse.redirect(accountUrl);
  }
}
