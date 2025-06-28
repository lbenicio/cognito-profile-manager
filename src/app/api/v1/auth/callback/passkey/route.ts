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
  
  if (result !== 'success') {
    return createErrorResponse(origin, 'result_missing', 'The passkey registration was not successful. Please try again.');
  }

  try {
    const session = await getSession();
    if (!session?.accessToken) {
      throw new Error('No active session found. Please log in again.');
    }
    
    const updateUserAttrCommand = new UpdateUserAttributesCommand({
        AccessToken: session.accessToken,
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
