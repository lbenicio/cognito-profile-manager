'use server';

import { jwtVerify, createRemoteJWKSet } from 'jose';
import { Logger } from '@/lib/logger';
import { getWellKnownConfig } from '../well-known';
import type { AuthTokenPayload } from '@/types/contracts/auth/auth.types';
import {
  oauthTokenErrorSchema,
  oauthTokenSuccessSchema,
} from '@/types/auth/token-response.types';

const logger = new Logger('SESSION-ACTIONS');

export async function refreshAuthTokens(refreshToken: string): Promise<{
  newClaims: AuthTokenPayload;
  newAccessToken: string;
  newRefreshToken: string;
  newExpiresIn: number;
} | null> {
  try {
    const wellknown = await getWellKnownConfig();
    const tokenEndpoint = wellknown.token_endpoint;

    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
      refresh_token: refreshToken,
    });

    const headers: HeadersInit = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    const clientSecret = process.env.COGNITO_CLIENT_SECRET;

    if (clientSecret) {
      headers['Authorization'] = `Basic ${Buffer.from(
        `${process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!}:${clientSecret}`
      ).toString('base64')}`;
    }

    const tokenResponse = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: headers,
      body: params.toString(),
      cache: 'no-store',
    });

    const responseBody: unknown = await tokenResponse.json();

    if (!tokenResponse.ok) {
      const errorResponse = oauthTokenErrorSchema.safeParse(responseBody);
      logger.error(
        'Failed to refresh tokens:',
        errorResponse.success
          ? errorResponse.data.error_description || errorResponse.data.error
          : 'The token endpoint returned an invalid error response.'
      );
      return null;
    }

    const tokenResult = oauthTokenSuccessSchema.safeParse(responseBody);
    if (!tokenResult.success) {
      logger.error('The token endpoint returned an invalid success response.');
      return null;
    }
    const tokens = tokenResult.data;

    const JWKS = createRemoteJWKSet(new URL(wellknown.jwks_uri));
    const { payload }: { payload: AuthTokenPayload } = await jwtVerify(
      tokens.id_token,
      JWKS,
      {
        issuer: wellknown.issuer,
        audience: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
      }
    );

    // Cognito refresh tokens can be long-lived. The response might not include a new refresh token.
    // If it doesn't, we must reuse the old one.
    const newRefreshToken = tokens.refresh_token || refreshToken;
    const newExpiresIn = tokens.expires_in ?? 3600;

    return {
      newClaims: payload,
      newAccessToken: tokens.access_token,
      newRefreshToken: newRefreshToken,
      newExpiresIn,
    };
  } catch (error) {
    logger.error('Exception in refreshAuthTokens:', error);
    return null;
  }
}
