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
    secure: false, // dev only
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

  // Destroy the session by clearing the auth cookie.
  cookies().set('auth_session', '', { expires: new Date(0), path: '/', domain });
  // Also clear the oauth state cookie to prevent issues with stale states.
  cookies().set('oauth_state', '', { expires: new Date(0), path: '/', domain });
  
  // If the session was a real OIDC session, redirect to the Cognito logout endpoint.
  if (sessionCookie && JSON.parse(sessionCookie).id_token) {
    const wellknownUrl = process.env.NEXT_PUBLIC_COGNITO_WELLKNOWN;
    if (wellknownUrl) {
      try {
        const wellknownResponse = await fetch(wellknownUrl, { cache: 'no-store' });
        const wellknown = await wellknownResponse.json();
        const logoutEndpoint = wellknown.logout_endpoint;

        // The logout redirect URL must be one of the "Allowed sign-out URLs" in Cognito
        if (!process.env.NEXT_PUBLIC_OAUTH2_CALLBACK_URL) {
          throw new Error('Missing NEXT_PUBLIC_OAUTH2_CALLBACK_URL env var for logout');
        }
        const logoutRedirectUrl = new URL(process.env.NEXT_PUBLIC_OAUTH2_CALLBACK_URL).origin;
        
        const params = new URLSearchParams({
          client_id: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
          logout_uri: new URL('/login', logoutRedirectUrl).toString(),
        });
        const logoutUrl = `${logoutEndpoint}?${params.toString()}`;
        redirect(logoutUrl);
        return; // Exit after redirecting
      } catch (e) {
        console.error("Failed to construct Cognito logout URL, falling back to local logout.", e);
      }
    }
  }
  
  // Fallback for dev logout or if Cognito logout fails.
  redirect('/login');
}
