
'use server';

import { cookies, headers } from 'next/headers';
import { redirect } from '@/navigation';

// Dev-only action for the "Sign In as Admin" button
export async function devAdminLogin() {
  if (process.env.NODE_ENV !== 'development') {
    return 'This action is only available in development.';
  }
  const sessionData = { username: 'admin', email: 'sso-admin-dev@example.com' };
  
  const host = headers().get('host')!;
  const hostname = new URL(`http://${host}`).hostname;
  const domain = hostname === 'localhost' ? undefined : hostname;

  cookies().set('auth_session', JSON.stringify(sessionData), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
    domain,
  });
  redirect('/');
}

// This function is a server action that handles user logout.
export async function logout() {
  const sessionCookie = cookies().get('auth_session')?.value;
  
  const host = headers().get('host')!;
  const hostname = new URL(`http://${host}`).hostname;
  const domain = hostname === 'localhost' ? undefined : hostname;
  
  let logoutUrl = '/login'; // Default/fallback URL
  let isOidcSession = false;

  if (sessionCookie) {
    try {
      const sessionData = JSON.parse(sessionCookie);
      // A real session from Cognito will have an id_token.
      if (sessionData?.id_token) {
        isOidcSession = true;
      }
    } catch {
      // Malformed cookie, treat as logged out.
      isOidcSession = false;
    }
  }

  // If it's a real OIDC session, build the Cognito Single-Log-Out URL.
  // This ensures the user is logged out of the identity provider as well.
  if (isOidcSession) {
    try {
      const wellknownUrl = process.env.NEXT_PUBLIC_COGNITO_WELLKNOWN;
      const callbackUrl = process.env.NEXT_PUBLIC_OAUTH2_CALLBACK_URL;
      const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;

      if (wellknownUrl && callbackUrl && clientId) {
        const wellknownResponse = await fetch(wellknownUrl, { cache: 'no-store' });
        if (wellknownResponse.ok) {
          const wellknown = await wellknownResponse.json();
          const authorizationEndpoint = wellknown.authorization_endpoint;
          
          if (authorizationEndpoint) {
            const cognitoDomain = new URL(authorizationEndpoint).origin;
            const cognitoLogoutUrl = new URL('/logout', cognitoDomain);
            
            // The logout_uri should be where the user is sent after Cognito logs them out.
            const logoutRedirectBase = new URL(callbackUrl).origin;
            const logoutRedirectUri = new URL('/login', logoutRedirectBase).toString();

            cognitoLogoutUrl.searchParams.set('client_id', clientId);
            cognitoLogoutUrl.searchParams.set('logout_uri', logoutRedirectUri);
            
            logoutUrl = cognitoLogoutUrl.toString();
          }
        }
      }
    } catch (e) {
      console.error("Error building Cognito logout URL, falling back to local redirect.", e);
      // The default logoutUrl = '/login' will be used if construction fails.
    }
  }

  // ALWAYS clear the session cookies, regardless of whether it's a dev or real session.
  // This is the most crucial step for ensuring the local session is terminated.
  cookies().set('auth_session', '', { expires: new Date(0), path: '/', domain });
  cookies().set('oauth_state', '', { expires: new Date(0), path: '/', domain });

  // Finally, perform the redirect to either the Cognito logout URL or the local login page.
  redirect(logoutUrl);
}
