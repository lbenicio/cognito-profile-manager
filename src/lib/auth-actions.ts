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
  
  // 1. Determine the appropriate logout URL.
  let logoutUrl = '/login'; // Default/fallback URL
  let isOidcSession = false;

  if (sessionCookie) {
    try {
      const sessionData = JSON.parse(sessionCookie);
      if (sessionData?.id_token) {
        isOidcSession = true;
      }
    } catch {
      // Malformed cookie, just treat as logged out.
      isOidcSession = false;
    }
  }

  // If it's a real OIDC session, build the Cognito Single-Log-Out URL.
  if (isOidcSession) {
    try {
      const wellknownUrl = process.env.NEXT_PUBLIC_COGNITO_WELLKNOWN;
      const callbackUrl = process.env.NEXT_PUBLIC_OAUTH2_CALLBACK_URL;
      const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;

      if (wellknownUrl && callbackUrl && clientId) {
        const wellknownResponse = await fetch(wellknownUrl, { cache: 'no-store' });
        if (wellknownResponse.ok) {
          const wellknown = await wellknownResponse.json();
          const logoutEndpoint = wellknown.logout_endpoint;

          const logoutRedirectBase = new URL(callbackUrl).origin;
          const logoutRedirectUri = new URL('/login', logoutRedirectBase).toString();

          const params = new URLSearchParams({
            client_id: clientId,
            logout_uri: logoutRedirectUri,
          });
          logoutUrl = `${logoutEndpoint}?${params.toString()}`;
        }
      }
    } catch (e) {
      console.error("Error building Cognito logout URL, falling back to local redirect.", e);
      // The default logoutUrl = '/login' will be used.
    }
  }

  // 2. ALWAYS clear the session cookies.
  cookies().set('auth_session', '', { expires: new Date(0), path: '/', domain });
  cookies().set('oauth_state', '', { expires: new Date(0), path: '/', domain });

  // 3. Finally, perform the redirect.
  redirect(logoutUrl);
}
