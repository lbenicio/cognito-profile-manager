
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { pathnames } from '@/navigation';
import { enablePasskey } from '@/lib/passkey-actions';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  const state = searchParams.get('state');
  const storedState = request.cookies.get('oauth_state')?.value;

  const profileUrl = new URL(pathnames['/profile'], origin);

  const clearStateCookie = (response: NextResponse) => {
    response.cookies.set('oauth_state', '', { expires: new Date(0), path: '/' });
    return response;
  };

  // --- CSRF check ---
  if (!state || !storedState || state !== storedState) {
    console.error('Passkey callback state mismatch or state missing.');
    profileUrl.searchParams.set('error', 'invalid_state');
    return clearStateCookie(NextResponse.redirect(profileUrl));
  }
  
  if (error) {
    console.error(`Cognito passkey callback error: ${error} - ${errorDescription}`);
    profileUrl.searchParams.set('error', error);
    if (errorDescription) {
      profileUrl.searchParams.set('error_description', errorDescription);
    }
    return clearStateCookie(NextResponse.redirect(profileUrl));
  }

  if (!code) {
    console.error('Authorization code missing from passkey callback.');
    profileUrl.searchParams.set('error', 'auth_code_missing');
    return clearStateCookie(NextResponse.redirect(profileUrl));
  }

  // If we got a code, it means the passkey was added successfully.
  // Now we exchange the code for a new session and update the user attribute.
  try {
    const wellknownUrl = process.env.NEXT_PUBLIC_COGNITO_WELLKNOWN;
    if (!wellknownUrl) throw new Error('Missing NEXT_PUBLIC_COGNITO_WELLKNOWN env var');

    const passkeyCallbackUrl = new URL('/api/v1/auth/callback/passkey', origin).toString();

    const wellknownResponse = await fetch(wellknownUrl, { cache: 'no-store' });
    if (!wellknownResponse.ok) throw new Error('Failed to fetch OpenID configuration');
    const wellknown = await wellknownResponse.json();
    
    const tokenEndpoint = wellknown.token_endpoint;

    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: passkeyCallbackUrl,
      client_id: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
    });

    const headers: HeadersInit = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };
    
    const clientSecret = process.env.COGNITO_CLIENT_SECRET;
    
    if (clientSecret) {
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
      console.error("Passkey flow: Failed to exchange code for tokens. Response:", tokens);
      const errorDetails = tokens.error_description || tokens.error || "Unknown token exchange error";
      throw new Error(`Token exchange failed: ${errorDetails}`);
    }

    // Now we have a fresh access token, use it to update the attribute
    const updateResult = await enablePasskey(tokens.access_token);
    if (!updateResult.success) {
      throw new Error(updateResult.message || "Failed to set passkey attribute after token exchange.");
    }
    
    // Set the new session cookie
    const sessionData = {
        id_token: tokens.id_token,
        access_token: tokens.access_token,
        expires_in: tokens.expires_in,
    };
    
    profileUrl.searchParams.set('result', 'success');
    const response = NextResponse.redirect(profileUrl);

    response.cookies.set('auth_session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionData.expires_in || 3600,
      path: '/',
      sameSite: 'lax',
    });
    
    revalidatePath(pathnames['/profile']);
    return clearStateCookie(response);

  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    console.error('Passkey callback handler error:', e);
    profileUrl.searchParams.set('error', 'passkey_update_failed');
    profileUrl.searchParams.set('error_description', errorMessage);
    return clearStateCookie(NextResponse.redirect(profileUrl));
  }
}
