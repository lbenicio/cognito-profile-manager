
'use server';

import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { pathnames } from '@/navigation';
import { cognitoClient, UpdateUserAttributesCommand } from '@/lib/cognito';
import { getSession, getUser } from '@/lib/auth';

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

  if (errorParam) {
    return createErrorResponse(origin, errorParam, errorDescription);
  }

  if (!result) {
    return createErrorResponse(origin, 'result_missing', 'The authorization result was not found in the callback.');
  }

  try {
    const session = await getSession();
    if (!session) throw new Error('no session');
    
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

    revalidatePath(pathnames['/security']);
    revalidatePath('/');
    
    return response;

  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    console.error('Passkey callback handler error:', e);
    return createErrorResponse(origin, 'passkey_update_failed', errorMessage);
  }
}
