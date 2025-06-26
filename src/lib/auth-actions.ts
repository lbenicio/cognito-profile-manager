'use server';

import { z } from 'zod';
import { cookies } from 'next/headers';
import { redirect } from '@/navigation';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// This function is a server action that handles user login.
// Note: For this example, we're not performing a real authentication check against Cognito.
// In a production app, you would use the AWS SDK to validate the user's credentials.
export async function login(prevState: string | undefined, formData: FormData) {
  const validatedFields = loginSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return 'Invalid email or password.';
  }
  
  const { email } = validatedFields.data;

  // Simulate a successful login for 'testuser'. In a real app, this username
  // would come from a successful Cognito authentication response.
  const username = 'testuser';
  
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
  
  // Redirect to the login page.
  redirect('/login');
}
