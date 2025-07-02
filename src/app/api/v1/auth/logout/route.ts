import { NextRequest, NextResponse } from 'next/server';
import { deleteSession, getSession } from '@/lib/session';
import { Logger } from '@/lib/logger';
import { getWellKnownConfig } from '@/lib/well-known';

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

    // 3. For real OAuth2 sessions, try to logout from Cognito
    const appUrl = process.env.APP_URL?.replace(/\/$/, '');
    const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
    const loginUrl = new URL('/login', request.url);

    // If we don't have the required config, just do local logout
    if (!appUrl || !clientId) {
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

    // 4. Try to get Cognito logout endpoint
    try {
      const wellknown = await getWellKnownConfig();
      const logoutEndpoint =
        wellknown.end_session_endpoint || wellknown.logout_endpoint;

      if (logoutEndpoint) {
        // Build Cognito logout URL with correct parameters
        const cognitoLogoutUrl = new URL(logoutEndpoint);
        cognitoLogoutUrl.searchParams.set('client_id', clientId);

        // AWS Cognito uses post_logout_redirect_uri parameter
        const redirectUri = `${appUrl}/login`;
        cognitoLogoutUrl.searchParams.set(
          'post_logout_redirect_uri',
          redirectUri
        );

        logger.info(
          `Redirecting to Cognito logout: ${cognitoLogoutUrl.toString()}`
        );

        const response = NextResponse.redirect(cognitoLogoutUrl.toString());
        response.cookies.set('oauth_state', '', {
          expires: new Date(0),
          path: '/',
        });

        return response;
      } else {
        logger.warn(
          'No logout endpoint found in OIDC well-known configuration'
        );
      }
    } catch (error) {
      logger.error('Failed to get Cognito logout endpoint:', error);
      if (error instanceof Error) {
        logger.error('Error details:', error.message);
      }
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
