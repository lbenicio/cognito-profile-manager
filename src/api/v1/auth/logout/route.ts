
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const wellknownUrl = process.env.NEXT_PUBLIC_COGNITO_WELLKNOWN;
  const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
  const appUrl = process.env.APP_URL?.replace(/\/$/, '');
  
  let cognitoDomain: string | undefined;

  // Attempt to discover the Cognito domain from the well-known endpoint
  if (wellknownUrl) {
      try {
          const wellknownResponse = await fetch(wellknownUrl, { cache: 'no-store' });
          if (wellknownResponse.ok) {
              const wellknown = await wellknownResponse.json();
              if (wellknown.authorization_endpoint) {
                  cognitoDomain = new URL(wellknown.authorization_endpoint).origin;
              }
          }
      } catch (e) {
          console.error("Failed to fetch or parse well-known config for logout.", e);
      }
  }

  // The URL to redirect to after Cognito has logged the user out.
  // This must be one of the "Allowed sign-out URLs" in your Cognito App Client settings.
  const postLogoutRedirectUri = new URL('/login', appUrl || request.url).toString();
  let finalLogoutUrl = new URL(postLogoutRedirectUri);

  // If we found the Cognito domain, construct the full logout URL.
  // Otherwise, we'll just redirect locally.
  if (cognitoDomain && clientId) {
      const cognitoLogoutUrl = new URL(`${cognitoDomain}/logout`);
      cognitoLogoutUrl.searchParams.set('client_id', clientId);
      cognitoLogoutUrl.searchParams.set('logout_uri', postLogoutRedirectUri);
      cognitoLogoutUrl.searchParams.set('response_type', 'code'); // Recommended by OIDC spec
      finalLogoutUrl = cognitoLogoutUrl;
  } else {
      console.warn("Could not construct Cognito logout URL. Performing local-only logout.");
  }
  
  // Create the response that will redirect the user.
  const response = NextResponse.redirect(finalLogoutUrl);

  // On that same response, clear the local session cookies.
  const isProd = process.env.NODE_ENV === 'production';
  const cookieDomain = isProd && appUrl ? new URL(appUrl).hostname : undefined;

  response.cookies.set('auth_session', '', { 
      expires: new Date(0), 
      path: '/',
      domain: cookieDomain
  });
  response.cookies.set('oauth_state', '', { 
      expires: new Date(0), 
      path: '/',
      domain: cookieDomain
  });

  return response;
}
