import { NextRequest, NextResponse } from 'next/server';
import { cognitoClient } from '@/lib/cognito';
import { GetUserCommand, UpdateUserAttributesCommand } from '@aws-sdk/client-cognito-identity-provider';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  const state = searchParams.get('state');
  const storedState = request.cookies.get('oauth_state')?.value;

  const requestUrl = new URL(request.url);

  // --- CSRF check ---
  if (!state || !storedState || state !== storedState) {
    console.error('OIDC callback state mismatch or state missing.', {
        queryState: state,
        cookieState: storedState
    });
    const loginUrl = new URL('/login', requestUrl.origin);
    loginUrl.searchParams.set('error', 'invalid_state');
    const response = NextResponse.redirect(loginUrl);
    response.cookies.set('oauth_state', '', { expires: new Date(0), path: '/' });
    return response;
  }
  
  const clearStateCookie = (response: NextResponse) => {
      response.cookies.set('oauth_state', '', { expires: new Date(0), path: '/' });
      return response;
  };

  if (error) {
    console.error(`OIDC callback error: ${error} - ${errorDescription}`);
    const loginUrl = new URL('/login', requestUrl.origin);
    loginUrl.searchParams.set('error', errorDescription || error);
    return clearStateCookie(NextResponse.redirect(loginUrl));
  }

  if (!code) {
    console.error('Authorization code missing from callback.');
    const loginUrl = new URL('/login', requestUrl.origin);
    loginUrl.searchParams.set('error', 'auth_code_missing');
    return clearStateCookie(NextResponse.redirect(loginUrl));
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

    // --- Update user fingerprint ---
    try {
      const { access_token } = tokens;

      const getUserCommand = new GetUserCommand({ AccessToken: access_token });
      const cognitoUser = await cognitoClient.send(getUserCommand);
      const attributes = cognitoUser.UserAttributes?.reduce((acc, attr) => {
          if (attr.Name && attr.Value) {
              acc[attr.Name] = attr.Value;
          }
          return acc;
      }, {} as Record<string, string>);

      const existingFingerprintRaw = attributes?.['custom:fingerprint'];
      let fingerprints = [];
      if (existingFingerprintRaw) {
          try {
              fingerprints = JSON.parse(existingFingerprintRaw);
          } catch {
            // Ignore if parsing fails, start fresh
          }
      }

      const newFingerprint = {
          date: new Date().toISOString(),
          ip: request.ip ?? 'Unknown',
          device: request.headers.get('user-agent') ?? 'Unknown',
      };
      fingerprints.unshift(newFingerprint);

      // Keep only the last 10 entries
      const updatedFingerprints = fingerprints.slice(0, 10);

      const updateUserAttrCommand = new UpdateUserAttributesCommand({
          AccessToken: access_token,
          UserAttributes: [{
              Name: 'custom:fingerprint',
              Value: JSON.stringify(updatedFingerprints),
          }],
      });
      await cognitoClient.send(updateUserAttrCommand);

    } catch (e) {
        // Log the error but don't block the login flow
        console.error("Failed to update user fingerprint:", e);
    }
    // --- End fingerprint update ---

    // The session will contain the tokens received from Cognito.
    const sessionData = {
        id_token: tokens.id_token,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
    };

    const dashboardUrl = new URL('/', requestUrl.origin);
    
    const response = NextResponse.redirect(dashboardUrl);

    response.cookies.set('auth_session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60, // 30 days; session lifetime is managed by token expiration
      path: '/',
      sameSite: 'lax',
    });
    
    return clearStateCookie(response);

  } catch (e) {
    console.error('Callback handler error:', e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    
    const loginUrl = new URL('/login', requestUrl.origin);
    loginUrl.searchParams.set('error', errorMessage);
    return clearStateCookie(NextResponse.redirect(loginUrl));
  }
}
