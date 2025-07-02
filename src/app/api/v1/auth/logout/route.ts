import { NextRequest, NextResponse } from 'next/server';
import { deleteSession, getSession } from '@/lib/session';
import { Logger } from '@/lib/logger';
import { getWellKnownConfig } from '@/lib/well-known';
import { getBaseUrl } from '@/lib/url';

const logger = new Logger('LOGOUT');

export async function GET(request: NextRequest) {
  try {
    logger.info('Logout request received');

    // Get current session to check if it's mock or real
    const session = await getSession();
    const isMockSession = session?.isMock === true;

    // 1. Clear the local session first
    await deleteSession();
    logger.info('Local session cleared');

    // 2. For mock sessions, just redirect to login
    if (isMockSession) {
      logger.info('Mock session - performing local logout only');
      const loginUrl = new URL('/login', request.url);
      const response = NextResponse.redirect(loginUrl);

      response.cookies.set('oauth_state', '', {
        expires: new Date(0),
        path: '/',
      });

      return response;
    }

    // 3. For real OAuth2 sessions, redirect to Cognito logout
    const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
    const loginUrl = new URL('/login', request.url);

    // If we don't have the required config, just do local logout
    if (!clientId) {
      logger.warn(
        'Missing Cognito configuration - performing local logout only'
      );
      const response = NextResponse.redirect(loginUrl);
      response.cookies.set('oauth_state', '', {
        expires: new Date(0),
        path: '/',
      });
      return response;
    }

    // 4. Try to get Cognito logout endpoint and redirect user
    try {
      const wellknown = await getWellKnownConfig();
      const logoutEndpoint =
        wellknown.end_session_endpoint || wellknown.logout_endpoint;

      if (logoutEndpoint) {
        // Build Cognito logout URL with correct parameters
        const cognitoLogoutUrl = new URL(logoutEndpoint);
        cognitoLogoutUrl.searchParams.set('client_id', clientId);

        // AWS Cognito uses logout_uri parameter (even with custom domains)
        const logoutRedirectUri = `${getBaseUrl()}/login`;
        cognitoLogoutUrl.searchParams.set('logout_uri', logoutRedirectUri);

        logger.info('Using logout_uri parameter for AWS Cognito');

        logger.info(
          `Redirecting user to Cognito logout: ${cognitoLogoutUrl.toString()}`
        );

        const response = NextResponse.redirect(cognitoLogoutUrl.toString());

        // Clear auth cookies before redirect
        response.cookies.set('oauth_state', '', {
          expires: new Date(0),
          path: '/',
        });

        return response;
      } else {
        logger.warn('No logout endpoint found in OIDC configuration');
      }
    } catch (error) {
      logger.error('Failed to get Cognito logout endpoint:', error);
    }

    // 5. Fallback to local logout if Cognito logout fails
    logger.info('Falling back to local logout - redirecting to login');
    const response = NextResponse.redirect(loginUrl);
    response.cookies.set('oauth_state', '', {
      expires: new Date(0),
      path: '/',
    });

    return response;
  } catch (error) {
    logger.error('Logout error:', error);

    // Error fallback: clear session and redirect to login
    try {
      await deleteSession();
    } catch (e) {
      logger.error('Failed to clear session during error handling:', e);
    }

    const loginUrl = new URL('/login', request.url);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.set('oauth_state', '', {
      expires: new Date(0),
      path: '/',
    });

    return response;
  }
}

export async function POST(request: NextRequest) {
  // Handle POST requests the same way as GET
  return GET(request);
}
