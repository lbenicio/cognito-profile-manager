'use server';

import { cookies } from 'next/headers';
import { redirect } from '@/navigation';

// This function is a server action that handles user login.
// In a real OAuth flow, this would be the callback handler that receives
// the authorization code from Cognito, exchanges it for tokens, and then
// creates the session. For now, it simulates a successful login.
export async function login(prevState: string | undefined, formData: FormData) {
  // Simulate a successful login for 'testuser'. In a real app, this username
  // would come from a successful Cognito authentication response (ID token).
  const username = 'testuser';
  const email = 'sso-user@example.com'; // Mock email from SSO
  
  try {
    // Set a session cookie containing basic user info.
    const sessionData = { username, email, loggedInAt: Date.now() };
    cookies().set('auth_session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // One week
      path: '/',
    });
  } catch (error) {
    if (error instanceof Error) {
      return error.message;
    }
    return 'An unknown error occurred.';
  }

  // Redirect to the dashboard on successful login.
  redirect('/');
}

// This function is a server action that handles user logout.
export async function logout() {
  // Destroy the session by clearing the cookie.
  cookies().set('auth_session', '', { expires: new Date(0) });
  
  // In a real OAuth flow, you would also redirect to the Cognito logout endpoint.
  // e.g., redirect(`https://<your-cognito-domain>/logout?client_id=...&logout_uri=...`);
  
  // For now, just redirect to the login page.
  redirect('/login');
}
