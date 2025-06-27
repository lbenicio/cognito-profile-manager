
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { pathnames } from '@/navigation';
import { enablePasskey } from '@/lib/passkey-actions';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const result = searchParams.get('result');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  const state = searchParams.get('state');
  const storedState = request.cookies.get('oauth_state')?.value;

  const profileUrl = new URL(pathnames['/profile'], origin);

  const clearStateCookie = (response: NextResponse) => {
    response.cookies.set('oauth_state', '', { expires: new Date(0), path: '/' });
    return response;
  };

  // --- CSRF check ---
  if (!state || !storedState || state !== storedState) {
    console.error('Passkey callback state mismatch or state missing.');
    profileUrl.searchParams.set('error', 'invalid_state');
    return clearStateCookie(NextResponse.redirect(profileUrl));
  }
  
  // --- Cognito error check ---
  if (error) {
    console.error(`Cognito passkey callback error: ${error} - ${errorDescription}`);
    profileUrl.searchParams.set('error', error);
    if (errorDescription) {
      profileUrl.searchParams.set('error_description', errorDescription);
    }
    return clearStateCookie(NextResponse.redirect(profileUrl));
  }

  // --- Success check ---
  if (result === 'success') {
    try {
      // The access token will be read from the session cookie inside the action
      const updateResult = await enablePasskey(); 
      
      if (!updateResult.success) {
          throw new Error(updateResult.message);
      } else {
          profileUrl.searchParams.set('passkey_status', 'success');
      }

    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        profileUrl.searchParams.set('error', 'passkey_update_failed');
        profileUrl.searchParams.set('error_description', errorMessage);
    }
  } else {
    // If not 'success' and not an 'error' from Cognito, treat as a failure.
    profileUrl.searchParams.set('error', 'passkey_update_failed');
    profileUrl.searchParams.set('error_description', 'An unexpected result was returned from the service.');
  }

  revalidatePath(pathnames['/profile']);
  
  return clearStateCookie(NextResponse.redirect(profileUrl));
}
