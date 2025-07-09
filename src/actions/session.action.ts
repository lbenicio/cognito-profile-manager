'use server';

import { jwtVerify, createRemoteJWKSet } from 'jose';
import { Logger } from '@/lib/logger';
import { getWellKnownConfig } from '@/lib/well-known';
import { cognitoClient, InitiateAuthCommand } from '@/lib/cognito';
import type { AuthTokenPayload } from '@/interfaces/auth/auth.interfaces';

const logger = new Logger('SESSION-ACTIONS');

export async function refreshAuthTokens(
  refreshToken: string,
  deviceKey?: string
): Promise<{
  newClaims: AuthTokenPayload;
  newAccessToken: string;
  newRefreshToken: string;
  newExpiresIn: number;
} | null> {
  try {
    const authParams: { REFRESH_TOKEN: string; DEVICE_KEY?: string } = {
      REFRESH_TOKEN: refreshToken,
    };
    if (deviceKey) {
      authParams.DEVICE_KEY = deviceKey;
      logger.info('Refreshing token with DeviceKey.');
    }

    const command = new InitiateAuthCommand({
      AuthFlow: 'REFRESH_TOKEN_AUTH',
      ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
      AuthParameters: authParams,
    });

    const response = await cognitoClient.send(command);
    const tokens = response.AuthenticationResult;

    if (!tokens || !tokens.IdToken || !tokens.AccessToken) {
      logger.error('Token refresh failed: Invalid response from Cognito SDK.');
      return null;
    }

    const wellknown = await getWellKnownConfig();
    const JWKS = createRemoteJWKSet(new URL(wellknown.jwks_uri));
    const { payload }: { payload: AuthTokenPayload } = await jwtVerify(
      tokens.IdToken,
      JWKS,
      {
        issuer: wellknown.issuer,
        audience: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
      }
    );

    // The response might not include a new refresh token.
    // If it doesn't, we must reuse the old one.
    const newRefreshToken = tokens.RefreshToken || refreshToken;
    const newExpiresIn = tokens.ExpiresIn ?? 3600;

    return {
      newClaims: payload,
      newAccessToken: tokens.AccessToken,
      newRefreshToken: newRefreshToken,
      newExpiresIn,
    };
  } catch (error) {
    logger.error('Exception in refreshAuthTokens:', error);
    return null;
  }
}
