import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { pathnames } from '@/navigation';
import { enablePasskey } from '@/lib/passkey-actions';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
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

  // --- Success: Update attribute and redirect ---
  const updateResult = await enablePasskey();

  if (!updateResult.success) {
      // If updating the attribute fails, redirect with an error.
      profileUrl.searchParams.set('error', 'passkey_update_failed');
      profileUrl.searchParams.set('error_description', updateResult.message);
  } else {
      // On success, set the status for the UI toast.
      profileUrl.searchParams.set('passkey_status', 'success');
  }
  
  // The enablePasskey action already calls revalidate, but we do it here
  // again just in case, to ensure the profile page re-fetches data.
  revalidatePath(pathnames['/profile']);
  
  return clearStateCookie(NextResponse.redirect(profileUrl));
}
