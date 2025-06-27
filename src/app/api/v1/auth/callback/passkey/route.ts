
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { GetUserCommand, UpdateUserAttributesCommand } from '@aws-sdk/client-cognito-identity-provider';
import { cognitoClient } from '@/lib/cognito';
import { pathnames } from '@/navigation';
import { getSession } from '@/lib/auth';
import UAParser from 'ua-parser-js';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  const state = searchParams.get('state');
  const storedState = request.cookies.get('oauth_state')?.value;

  const accountUrl = new URL(pathnames['/account'], origin);
  
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

    // Get current user attributes to append to the passkeys list
    const getUserCommand = new GetUserCommand({ AccessToken: session.access_token });
    const cognitoUser = await cognitoClient.send(getUserCommand);
    const attributes = cognitoUser.UserAttributes?.reduce((acc, attr) => {
        if (attr.Name && attr.Value) {
            acc[attr.Name] = attr.Value;
        }
        return acc;
    }, {} as Record<string, string>);

    // Prepare new passkey info
    const uaString = request.headers.get('user-agent') ?? 'Unknown';
    const parser = new UAParser(uaString);
    const browser = parser.getBrowser();
    const os = parser.getOS();
    const passkeyName = (browser.name && os.name) ? `${browser.name} on ${os.name}` : 'New Passkey';

    const newPasskeyInfo = {
        name: passkeyName,
        date: new Date().toISOString(),
        ip: request.ip ?? 'Unknown',
        userAgent: uaString,
    };

    // Get existing passkeys and add the new one
    let passkeys = [];
    const existingPasskeysRaw = attributes?.['custom:passkeys'];
    if (existingPasskeysRaw) {
        try {
            passkeys = JSON.parse(existingPasskeysRaw);
        } catch {
            // Ignore if parsing fails, start fresh
        }
    }
    passkeys.unshift(newPasskeyInfo); // Add to the beginning of the array

    // Use the existing access token to update the user attributes
    const updateCommand = new UpdateUserAttributesCommand({
      AccessToken: session.access_token,
      UserAttributes: [
        { Name: 'custom:pless', Value: 'true' },
        { Name: 'custom:passkeys', Value: JSON.stringify(passkeys) },
      ],
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
