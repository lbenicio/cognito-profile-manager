
'use server';

import { jwtVerify, createRemoteJWKSet } from 'jose';
import type { JWTPayload } from 'jose';

type NewTokenResponse = {
  id_token: string;
  access_token: string;
  expires_in?: number;
};

export async function refreshAuthTokens(refreshToken: string): Promise<{ newClaims: JWTPayload, newAccessToken: string, newRefreshToken: string, newExpiresIn: number } | null> {
  try {
    const wellknownUrl = process.env.NEXT_PUBLIC_COGNITO_WELLKNOWN;
    if (!wellknownUrl) throw new Error('Missing NEXT_PUBLIC_COGNITO_WELLKNOWN env var');

    const wellknownResponse = await fetch(wellknownUrl, { cache: 'no-store' });
    if (!wellknownResponse.ok) throw new Error('Failed to fetch OpenID configuration from provider.');
    const wellknown = await wellknownResponse.json();

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

    const tokens: NewTokenResponse & { refresh_token?: string } = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error('Failed to refresh tokens:', (tokens as any).error_description || (tokens as any).error || 'Unknown error');
      return null;
    }

    const JWKS = createRemoteJWKSet(new URL(wellknown.jwks_uri));
    const { payload } = await jwtVerify(tokens.id_token, JWKS, {
        issuer: wellknown.issuer,
        audience: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
    });

    // Cognito refresh tokens can be long-lived. The response might not include a new refresh token.
    // If it doesn't, we must reuse the old one.
    const newRefreshToken = tokens.refresh_token || refreshToken;
    const newExpiresIn = tokens.expires_in ?? 3600;

    return { 
      newClaims: payload,
      newAccessToken: tokens.access_token,
      newRefreshToken: newRefreshToken,
      newExpiresIn 
    };

  } catch (error) {
    console.error('Exception in refreshAuthTokens:', error);
    return null;
  }
}
