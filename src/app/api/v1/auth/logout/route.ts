
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const sessionCookie = cookies().get('auth_session')?.value;
  
  const host = request.nextUrl.origin;
  
  let logoutUrl = new URL('/login', host).toString();
  let isOidcSession = false;

  if (sessionCookie) {
    try {
      const sessionData = JSON.parse(sessionCookie);
      if (sessionData?.id_token) {
        isOidcSession = true;
      }
    } catch {
      isOidcSession = false;
    }
  }

  if (isOidcSession) {
    try {
      const wellknownUrl = process.env.NEXT_PUBLIC_COGNITO_WELLKNOWN;
      const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;

      if (wellknownUrl && clientId) {
        const wellknownResponse = await fetch(wellknownUrl, { cache: 'no-store' });
        if (wellknownResponse.ok) {
          const wellknown = await wellknownResponse.json();
          const authorizationEndpoint = wellknown.authorization_endpoint;
          
          if (authorizationEndpoint) {
            const cognitoDomain = new URL(authorizationEndpoint).origin;
            const cognitoLogoutUrl = new URL('/logout', cognitoDomain);
            
            const logoutRedirectUri = new URL('/login', host).toString();

            cognitoLogoutUrl.searchParams.set('client_id', clientId);
            cognitoLogoutUrl.searchParams.set('logout_uri', logoutRedirectUri);
            
            logoutUrl = cognitoLogoutUrl.toString();
          }
        }
      }
    } catch (e) {
      console.error("Error building Cognito logout URL, falling back to local redirect.", e);
    }
  }

  const response = NextResponse.json({ success: true, logoutUrl });
  
  response.cookies.set('auth_session', '', { expires: new Date(0), path: '/' });
  response.cookies.set('oauth_state', '', { expires: new Date(0), path: '/' });

  return response;
}
