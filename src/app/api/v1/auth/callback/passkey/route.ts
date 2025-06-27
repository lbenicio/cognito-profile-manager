import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { pathnames } from '@/navigation';

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

  // --- Success ---
  // A code is returned on success, but we don't need to exchange it.
  // The act of returning to this callback successfully implies the passkey was added.
  // We just need to revalidate the path to force a refresh of the user data.
  revalidatePath(pathnames['/profile']);
  profileUrl.searchParams.set('passkey_status', 'success');
  
  return clearStateCookie(NextResponse.redirect(profileUrl));
}
