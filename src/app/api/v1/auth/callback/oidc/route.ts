import { NextRequest, NextResponse } from 'next/server';
import { cognitoClient } from '@/lib/cognito';
import { GetUserCommand, UpdateUserAttributesCommand } from '@aws-sdk/client-cognito-identity-provider';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  const state = searchParams.get('state');
  const storedState = request.cookies.get('oauth_state')?.value;

  const loginUrl = new URL('/login', origin);

  // --- CSRF check ---
  if (!state || !storedState || state !== storedState) {
    console.error('OIDC callback state mismatch or state missing.', {
        queryState: state,
        cookieState: storedState
    });
    loginUrl.searchParams.set('error', 'invalid_state');
    const response = NextResponse.redirect(loginUrl);
    response.cookies.set('oauth_state', '', { expires: new Date(0), path: '/' });
    return response;
  }
  
  if (error) {
    console.error(`OIDC callback error: ${error} - ${errorDescription}`);
    loginUrl.searchParams.set('error', errorDescription || error);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.set('oauth_state', '', { expires: new Date(0), path: '/' });
    return response;
  }

  if (!code) {
    console.error('Authorization code missing from callback.');
    loginUrl.searchParams.set('error', 'auth_code_missing');
    const response = NextResponse.redirect(loginUrl);
    response.cookies.set('oauth_state', '', { expires: new Date(0), path: '/' });
    return response;
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
      const errorDetails = tokens.error_description || tokens.error || "Token exchange failed.";
      loginUrl.searchParams.set('error', errorDetails);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.set('oauth_state', '', { expires: new Date(0), path: '/' });
      return response;
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

    const sessionData = {
        id_token: tokens.id_token,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
    };

    const dashboardUrl = new URL('/', origin);
    const response = NextResponse.redirect(dashboardUrl);

    // Set auth cookie AND clear state cookie on the SAME response object before returning.
    response.cookies.set('auth_session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
      sameSite: 'lax',
    });
    
    response.cookies.set('oauth_state', '', { 
        expires: new Date(0), 
        path: '/' 
    });

    return response;

  } catch (e) {
    console.error('Callback handler error:', e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    
    loginUrl.searchParams.set('error', errorMessage);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.set('oauth_state', '', { expires: new Date(0), path: '/' });
    return response;
  }
}
