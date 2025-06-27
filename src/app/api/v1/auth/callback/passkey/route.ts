
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { pathnames } from '@/navigation';
import { getUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  const state = searchParams.get('state');
  const storedState = request.cookies.get('oauth_state')?.value;

  const securityUrl = new URL(pathnames['/security'], origin);
  
  const clearStateCookie = (response: NextResponse) => {
    response.cookies.set('oauth_state', '', { expires: new Date(0), path: '/' });
    return response;
  };

  // --- CSRF check ---
  if (!state || !storedState || state !== storedState) {
    console.error('Passkey callback state mismatch or state missing.', {
        queryState: state,
        cookieState: storedState
    });
    securityUrl.searchParams.set('error', 'invalid_state');
    securityUrl.searchParams.set('error_description', 'Your session has expired or is invalid. Please try adding the passkey again.');
    return clearStateCookie(NextResponse.redirect(securityUrl));
  }
  
  if (error) {
    console.error(`Cognito passkey callback error: ${error} - ${errorDescription}`);
    securityUrl.searchParams.set('error', error);
    if (errorDescription) {
      securityUrl.searchParams.set('error_description', errorDescription);
    }
    return clearStateCookie(NextResponse.redirect(securityUrl));
  }

  // The presence of a "code" from Cognito indicates the passkey was added successfully.
  if (!code) {
    console.error('Authorization code missing from passkey callback.');
    securityUrl.searchParams.set('error', 'auth_code_missing');
    return clearStateCookie(NextResponse.redirect(securityUrl));
  }

  try {
    // Calling getUser() first ensures the session is validated and refreshed if necessary.
    const user = await getUser();
    if (!user) {
        throw new Error('User session not found or has expired. Please log in again.');
    }
    
    // Cognito has already associated the new passkey with the user.
    // All we need to do is redirect back to the security page.

    securityUrl.searchParams.set('result', 'success');
    const response = NextResponse.redirect(securityUrl);
    
    // Revalidate paths to ensure the new device list is fetched.
    revalidatePath(pathnames['/security']);
    revalidatePath('/');
    
    // Clean up the state cookie and return the redirect response.
    return clearStateCookie(response);

  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    console.error('Passkey callback handler error:', e);
    securityUrl.searchParams.set('error', 'passkey_update_failed');
    securityUrl.searchParams.set('error_description', errorMessage);
    return clearStateCookie(NextResponse.redirect(securityUrl));
  }
}
