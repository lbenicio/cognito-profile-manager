
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { UpdateUserAttributesCommand } from '@aws-sdk/client-cognito-identity-provider';
import { cognitoClient } from '@/lib/cognito';
import { pathnames } from '@/navigation';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const { searchParams, origin, nextUrl } = request;
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  const state = searchParams.get('state');
  const storedState = request.cookies.get('oauth_state')?.value;

  const accountUrl = new URL(pathnames['/account'], origin);
  
  const hostname = nextUrl.hostname;
  const domain = hostname === 'localhost' ? undefined : hostname;

  const clearStateCookie = (response: NextResponse) => {
    response.cookies.set('oauth_state', '', { expires: new Date(0), path: '/', domain });
    return response;
  };

  // --- CSRF check ---
  if (!state || !storedState || state !== storedState) {
    console.error('Passkey callback state mismatch or state missing.', {
        queryState: state,
        cookieState: storedState
    });
    accountUrl.searchParams.set('error', 'invalid_state');
    accountUrl.searchParams.set('error_description', 'Your session has expired or is invalid. Please try adding the passkey again.');
    return clearStateCookie(NextResponse.redirect(accountUrl));
  }
  
  if (error) {
    console.error(`Cognito passkey callback error: ${error} - ${errorDescription}`);
    accountUrl.searchParams.set('error', error);
    if (errorDescription) {
      accountUrl.searchParams.set('error_description', errorDescription);
    }
    return clearStateCookie(NextResponse.redirect(accountUrl));
  }

  // The presence of a "code" from Cognito indicates the passkey was added successfully.
  // We can now use the user's existing session to update their attributes.
  if (!code) {
    console.error('Authorization code missing from passkey callback.');
    accountUrl.searchParams.set('error', 'auth_code_missing');
    return clearStateCookie(NextResponse.redirect(accountUrl));
  }

  try {
    const session = await getSession();
    if (!session?.access_token) {
        throw new Error('User session not found or access token missing.');
    }

    // Use the existing access token to update the user attribute
    const updateCommand = new UpdateUserAttributesCommand({
      AccessToken: session.access_token,
      UserAttributes: [{ Name: 'custom:pless', Value: 'true' }],
    });
    await cognitoClient.send(updateCommand);
    
    // Redirect to the account page with a success message.
    accountUrl.searchParams.set('result', 'success');
    const response = NextResponse.redirect(accountUrl);
    
    // Revalidate paths to ensure fresh data is shown.
    revalidatePath(pathnames['/account']);
    revalidatePath('/');
    
    // Clean up the state cookie and return the redirect response.
    return clearStateCookie(response);

  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    console.error('Passkey callback handler error:', e);
    accountUrl.searchParams.set('error', 'passkey_update_failed');
    accountUrl.searchParams.set('error_description', errorMessage);
    return clearStateCookie(NextResponse.redirect(accountUrl));
  }
}
