'use server';

import { cookies, headers } from 'next/headers';

export async function getPasskeyAddUrl(): Promise<{
  success: boolean;
  url?: string;
  message?: string;
}> {
  try {
    const wellknownUrl = process.env.NEXT_PUBLIC_COGNITO_WELLKNOWN;
    const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
    const scope = process.env.NEXT_PUBLIC_OAUTH2_SCOPE;
    
    if (!wellknownUrl || !clientId || !scope) {
      throw new Error('Passkey client configuration is missing.');
    }
    
    // The origin of the request is needed to build the callback URL.
    const requestHeaders = headers();
    const origin = requestHeaders.get('origin');
    if (!origin) {
      throw new Error('Could not determine request origin for callback URL.');
    }
    const passkeyCallbackUrl = new URL('/api/v1/auth/callback/passkey', origin).toString();

    const wellknownResponse = await fetch(wellknownUrl, { cache: 'no-store' });
    if (!wellknownResponse.ok) throw new Error('Failed to fetch OpenID configuration');
    const wellknown = await wellknownResponse.json();
    const authorizationEndpoint = wellknown.authorization_endpoint;

    const cognitoDomain = new URL(authorizationEndpoint).origin;
    const passkeyUrl = new URL(`${cognitoDomain}/passkeys/add`);
    
    // --- CSRF protection ---
    const state = Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString('hex');
    cookies().set('oauth_state', state, {
      path: '/',
      maxAge: 600, // 10 minutes
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    passkeyUrl.searchParams.set('client_id', clientId);
    passkeyUrl.searchParams.set('response_type', 'code');
    passkeyUrl.searchParams.set('scope', scope);
    passkeyUrl.searchParams.set('redirect_uri', passkeyCallbackUrl);
    passkeyUrl.searchParams.set('state', state);

    return { success: true, url: passkeyUrl.toString() };
  } catch (error: any) {
    console.error('getPasskeyAddUrl error:', error);
    return { success: false, message: error.message || 'An unknown error occurred.' };
  }
}
