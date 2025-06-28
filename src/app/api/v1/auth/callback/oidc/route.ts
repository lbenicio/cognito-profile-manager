
import { NextRequest, NextResponse } from 'next/server';
import { cognitoClient, GetUserCommand, UpdateUserAttributesCommand } from '@/lib/cognito';

function createErrorResponse(origin: string, error: string, description?: string): NextResponse {
  const loginUrl = new URL('/login', origin);
  const errorMessage = description || error;
  loginUrl.searchParams.set('error', errorMessage);
  
  console.error(`OIDC Callback Error: Redirecting to login. Reason: ${errorMessage}`);

  const response = NextResponse.redirect(loginUrl);
  // Ensure state cookie is always cleared on error
  response.cookies.set('oauth_state', '', { expires: new Date(0), path: '/' });
  return response;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const errorParam = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  const state = searchParams.get('state');
  const storedState = request.cookies.get('oauth_state')?.value;

  // --- Handle explicit errors from OIDC provider first ---
  if (errorParam) {
    return createErrorResponse(origin, errorParam, errorDescription || 'An error occurred during authentication.');
  }
  
  // --- Perform pre-flight checks before the try...catch block ---
  if (!state || !storedState || state !== storedState) {
    return createErrorResponse(origin, 'invalid_state', 'Your session has expired or is invalid. Please try signing in again.');
  }
  
  if (!code) {
    return createErrorResponse(origin, 'auth_code_missing', 'The authorization code was not found in the callback. Please try again.');
  }

  // --- Main token exchange logic ---
  try {
    const wellknownUrl = process.env.NEXT_PUBLIC_COGNITO_WELLKNOWN;
    if (!wellknownUrl) throw new Error('Missing NEXT_PUBLIC_COGNITO_WELLKNOWN env var');

    const callbackUrl = process.env.NEXT_PUBLIC_OAUTH2_CALLBACK_URL;
    if (!callbackUrl) {
      throw new Error('Missing NEXT_PUBLIC_OAUTH2_CALLBACK_URL env var');
    }

    const wellknownResponse = await fetch(wellknownUrl, { cache: 'no-store' });
    if (!wellknownResponse.ok) throw new Error('Failed to fetch OpenID configuration from provider.');
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
      const errorDetails = tokens.error_description || tokens.error || "Token exchange failed.";
      throw new Error(errorDetails);
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
      
      // A more robust way to get the user's IP
      let ip = 'Unknown';
      try {
        const ipResponse = await fetch('https://checkip.amazonaws.com/', { cache: 'no-store' });
        if (ipResponse.ok) {
          ip = (await ipResponse.text()).trim();
        } else {
           console.error(`checkip.amazonaws.com failed with status: ${ipResponse.status}. Falling back to headers.`);
           const forwarded = request.headers.get('x-forwarded-for');
           ip = forwarded ? forwarded.split(/, /)[0] : request.ip ?? 'Unknown';
        }
      } catch (ipError) {
        console.error("Could not fetch user IP from checkip.amazonaws.com:", ipError, ". Falling back to headers.");
        const forwarded = request.headers.get('x-forwarded-for');
        ip = forwarded ? forwarded.split(/, /)[0] : request.ip ?? 'Unknown';
      }

      const newFingerprint = {
          date: new Date().toISOString(),
          ip: ip,
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
    
    const isProd = process.env.NODE_ENV === 'production';

    // Set auth cookie AND clear state cookie on the SAME response object before returning.
    response.cookies.set('auth_session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: isProd,
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
      sameSite: isProd ? 'none' : 'lax',
    });
    
    response.cookies.set('oauth_state', '', { 
        expires: new Date(0), 
        path: '/' 
    });

    return response;

  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred during the login process.';
    return createErrorResponse(origin, 'callback_error', errorMessage);
  }
}
