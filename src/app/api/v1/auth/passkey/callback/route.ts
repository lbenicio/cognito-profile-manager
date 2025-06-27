
'use server';

import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { pathnames } from '@/navigation';
import { getSession } from '@/lib/auth';
import { cognitoClient, UpdateUserAttributesCommand } from '@/lib/cognito';

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

  if (!code) {
    console.error('Authorization code missing from passkey callback.');
    securityUrl.searchParams.set('error', 'auth_code_missing');
    securityUrl.searchParams.set('error_description', 'The operation could not be completed because the authorization code was missing.');
    return clearStateCookie(NextResponse.redirect(securityUrl));
  }

  try {
    const session = await getSession();
    if (!session) {
        throw new Error('User session not found during passkey callback.');
    }

    // Update user attribute to indicate passkey is set
    const updateUserAttrCommand = new UpdateUserAttributesCommand({
        AccessToken: session.access_token,
        UserAttributes: [{
            Name: 'custom:pless',
            Value: 'true',
        }],
    });
    await cognitoClient.send(updateUserAttrCommand);

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
