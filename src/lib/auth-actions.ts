'use server';

import { cookies } from 'next/headers';
import { redirect } from '@/navigation';

// Action for the main SSO login button
export async function ssoLogin() {
  const wellknownUrl = process.env.NEXT_PUBLIC_COGNITO_WELLKNOWN;
  if (!wellknownUrl) throw new Error('Missing NEXT_PUBLIC_COGNITO_WELLKNOWN env var');
  
  const wellknownResponse = await fetch(wellknownUrl);
  if (!wellknownResponse.ok) throw new Error('Failed to fetch OpenID configuration');
  const wellknown = await wellknownResponse.json();

  const authorizationEndpoint = wellknown.authorization_endpoint;

  const params = new URLSearchParams({
    client_id: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
    response_type: 'code',
    scope: 'openid profile email phone address',
    redirect_uri: process.env.NEXT_PUBLIC_OAUTH2_CALLBACK_URL!,
  });

  const loginUrl = `${authorizationEndpoint}?${params.toString()}`;
  redirect(loginUrl);
}

// Dev-only action for the "Sign In as Admin" button
export async function devAdminLogin() {
  if (process.env.NODE_ENV !== 'development') {
    return 'This action is only available in development.';
  }
  const sessionData = { username: 'admin', email: 'sso-admin-dev@example.com' };
  cookies().set('auth_session', JSON.stringify(sessionData), {
    httpOnly: true,
    secure: false, // dev only
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });
  redirect('/');
}

// This function is a server action that handles user logout.
export async function logout() {
  const sessionCookie = cookies().get('auth_session')?.value;
  // Destroy the session by clearing the cookie.
  cookies().set('auth_session', '', { expires: new Date(0) });
  
  // If the session was a real OIDC session, redirect to the Cognito logout endpoint.
  if (sessionCookie && JSON.parse(sessionCookie).id_token) {
    const wellknownUrl = process.env.NEXT_PUBLIC_COGNITO_WELLKNOWN;
    if (wellknownUrl) {
      try {
        const wellknownResponse = await fetch(wellknownUrl);
        const wellknown = await wellknownResponse.json();
        const logoutEndpoint = wellknown.logout_endpoint;

        // The logout redirect URL must be one of the "Allowed sign-out URLs" in Cognito
        const logoutRedirectUrl = new URL(process.env.NEXT_PUBLIC_OAUTH2_CALLBACK_URL!).origin;
        
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
