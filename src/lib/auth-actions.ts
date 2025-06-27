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

  // Always destroy the session by clearing the auth cookies first.
  cookies().set('auth_session', '', { expires: new Date(0), path: '/', domain });
  cookies().set('oauth_state', '', { expires: new Date(0), path: '/', domain });

  // If there was no session cookie to begin with, just go to login.
  if (!sessionCookie) {
    redirect('/login');
    return;
  }
  
  try {
    const sessionData = JSON.parse(sessionCookie);

    // If it was a real OIDC session (has an id_token), redirect to Cognito for a full Single-Log-Out.
    if (sessionData && sessionData.id_token) {
      const wellknownUrl = process.env.NEXT_PUBLIC_COGNITO_WELLKNOWN;
      if (wellknownUrl) {
          const wellknownResponse = await fetch(wellknownUrl, { cache: 'no-store' });
          if (wellknownResponse.ok) {
            const wellknown = await wellknownResponse.json();
            const logoutEndpoint = wellknown.logout_endpoint;

            if (process.env.NEXT_PUBLIC_OAUTH2_CALLBACK_URL && process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID) {
              const logoutRedirectBase = new URL(process.env.NEXT_PUBLIC_OAUTH2_CALLBACK_URL).origin;
              const logoutRedirectUri = new URL('/login', logoutRedirectBase).toString();

              const params = new URLSearchParams({
                client_id: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
                logout_uri: logoutRedirectUri,
              });
              const logoutUrl = `${logoutEndpoint}?${params.toString()}`;
              redirect(logoutUrl);
              return; // Exit after redirecting to Cognito
            }
          }
      }
    }
  } catch (e) {
    console.error("Error during logout, falling back to local redirect.", e);
  }
  
  // Fallback for dev logout or if Cognito logout fails.
  redirect('/login');
}
