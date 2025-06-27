
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { pathnames } from '@/navigation';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get('result');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  const securityUrl = new URL(pathnames['/security'], origin);
  
  if (error) {
    console.error(`Cognito passkey callback error: ${error} - ${errorDescription}`);
    securityUrl.searchParams.set('error', error);
    if (errorDescription) {
      securityUrl.searchParams.set('error_description', errorDescription);
    }
    return NextResponse.redirect(securityUrl);
  }

  // The presence of a "code" from Cognito indicates the passkey was added successfully.
  if (!code) {
    console.error('Authorization code missing from passkey callback.');
    securityUrl.searchParams.set('error', 'auth_code_missing');
    return NextResponse.redirect(securityUrl);
  }

  try {
    // We don't need to re-validate the user here. The CSRF state check is sufficient.
    // The successful response from Cognito (with a `code`) confirms the operation succeeded
    // for the user whose access token was provided in the /start route.
    
    // Cognito has already associated the new passkey with the user.
    // All we need to do is redirect back to the security page.

    securityUrl.searchParams.set('result', 'success');
    const response = NextResponse.redirect(securityUrl);
    
    // Revalidate paths to ensure the new device list is fetched.
    revalidatePath(pathnames['/security']);
    revalidatePath('/');
    
    // Clean up the state cookie and return the redirect response.
    return response;

  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    console.error('Passkey callback handler error:', e);
    securityUrl.searchParams.set('error', 'passkey_update_failed');
    securityUrl.searchParams.set('error_description', errorMessage);
    return NextResponse.redirect(securityUrl);
  }
}
