import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { pathnames } from '@/navigation';
import { enablePasskey } from '@/lib/passkey-actions';
import { cookies } from 'next/headers';

async function exchangeCodeForTokens(code: string, callbackUrl: string) {
    const wellknownUrl = process.env.NEXT_PUBLIC_COGNITO_WELLKNOWN;
    if (!wellknownUrl) throw new Error('Missing NEXT_PUBLIC_COGNITO_WELLKNOWN env var');

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
      console.error("Failed to exchange code for tokens. Response:", tokens);
      const errorDetails = tokens.error_description || tokens.error || "Unknown token exchange error";
      throw new Error(`Token exchange failed: ${errorDetails}`);
    }
    return tokens;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  const state = searchParams.get('state');
  const storedState = request.cookies.get('oauth_state')?.value;
  const code = searchParams.get('code');

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
  
  // --- Cognito error check ---
  if (error) {
    console.error(`Cognito passkey callback error: ${error} - ${errorDescription}`);
    profileUrl.searchParams.set('error', error);
    if (errorDescription) {
      profileUrl.searchParams.set('error_description', errorDescription);
    }
    return clearStateCookie(NextResponse.redirect(profileUrl));
  }

  try {
      let accessToken: string | undefined;

      // If Cognito returns a code, exchange it for new tokens to refresh the session
      if (code) {
          const passkeyCallbackUrl = new URL(request.url).origin + request.nextUrl.pathname;
          const tokens = await exchangeCodeForTokens(code, passkeyCallbackUrl);
          
          accessToken = tokens.access_token;
          const sessionData = {
              id_token: tokens.id_token,
              access_token: accessToken,
              expires_in: tokens.expires_in,
          };

          // Update the session cookie with fresh tokens
          cookies().set('auth_session', JSON.stringify(sessionData), {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              maxAge: sessionData.expires_in || 3600,
              path: '/',
              sameSite: 'lax',
          });
      }

      // Now that the session is updated, enable the passkey attribute using the fresh token
      const updateResult = await enablePasskey(accessToken);
      
      if (!updateResult.success) {
          throw new Error(updateResult.message);
      } else {
          profileUrl.searchParams.set('passkey_status', 'success');
      }

  } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      profileUrl.searchParams.set('error', 'passkey_update_failed');
      profileUrl.searchParams.set('error_description', errorMessage);
  }

  revalidatePath(pathnames['/profile']);
  
  return clearStateCookie(NextResponse.redirect(profileUrl));
}
