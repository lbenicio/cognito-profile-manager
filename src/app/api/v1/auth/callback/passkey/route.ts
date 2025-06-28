
'use server';

import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { pathnames } from '@/navigation';
import { cognitoClient, UpdateUserAttributesCommand } from '@/lib/cognito';
import { getSession } from '@/lib/auth';

function createErrorResponse(origin: string, error: string, description?: string | null): NextResponse {
  const securityUrl = new URL(pathnames['/security'], origin);
  securityUrl.searchParams.set('error', error);
  if (description) {
    securityUrl.searchParams.set('error_description', description);
  }
  const response = NextResponse.redirect(securityUrl);
  
  const isProd = process.env.NODE_ENV === 'production';
  const appUrl = process.env.APP_URL?.replace(/\/$/, '');
  
  let cookieDomain: string | undefined;
  if (isProd && appUrl) {
      const hostname = new URL(appUrl).hostname;
      cookieDomain = hostname.startsWith('www.') ? hostname.substring(4) : hostname;
  }

  // Ensure state cookie is always cleared on error
  response.cookies.set('oauth_state', '', { 
    expires: new Date(0), 
    path: '/',
    domain: cookieDomain
  });
  return response;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const result = searchParams.get('result');
  const errorParam = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  const state = searchParams.get('state');
  const storedState = request.cookies.get('oauth_state')?.value;
  
  // --- Security Checks ---
  if (errorParam) {
    return createErrorResponse(origin, errorParam, errorDescription);
  }
  
  if (!state || !storedState || state !== storedState) {
    return createErrorResponse(origin, 'invalid_state', 'Your session has expired or is invalid. Please try registering your passkey again.');
  }

  // --- Main Logic ---
  if (result !== 'success') {
    return createErrorResponse(origin, 'result_missing', 'The passkey registration was not successful. Please try again.');
  }

  try {
    const session = await getSession();
    if (!session?.access_token) {
      throw new Error('No active session found. Please log in again.');
    }
    
    // If the result is "success", update the user attribute in Cognito to reflect that passkeys are enabled.
    const updateUserAttrCommand = new UpdateUserAttributesCommand({
        AccessToken: session.access_token,
        UserAttributes: [{
            Name: 'custom:pless',
            Value: 'true',
        }],
    });
    await cognitoClient.send(updateUserAttrCommand);

    const securityUrl = new URL(pathnames['/security'], origin);
    securityUrl.searchParams.set('result', 'success');
    const response = NextResponse.redirect(securityUrl);
    
    const isProd = process.env.NODE_ENV === 'production';
    const appUrl = process.env.APP_URL?.replace(/\/$/, '');
    
    let cookieDomain: string | undefined;
    if (isProd && appUrl) {
        const hostname = new URL(appUrl).hostname;
        cookieDomain = hostname.startsWith('www.') ? hostname.substring(4) : hostname;
    }
    
    // Clean up the state cookie on success
    response.cookies.set('oauth_state', '', { 
        expires: new Date(0), 
        path: '/',
        domain: cookieDomain
    });

    // Revalidate paths to reflect the new security status
    revalidatePath(pathnames['/security']);
    revalidatePath('/'); // For the security health widget on the dashboard
    
    return response;

  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    console.error('Passkey callback handler error:', e);
    return createErrorResponse(origin, 'passkey_update_failed', errorMessage);
  }
}
