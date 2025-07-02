'use server';

import 'server-only';
import { cache } from 'react';
import { getCache, setCache } from './cache';
import { Logger } from './logger';

const logger = new Logger('WELL-KNOWN');
const CACHE_KEY = 'oidc-well-known-config';
const CACHE_TTL_SECONDS = 24 * 60 * 60; // 24 hours

interface WellKnownConfig {
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
  userinfo_endpoint: string;
  jwks_uri: string;
  end_session_endpoint?: string;
  logout_endpoint?: string;
  [key: string]: any;
}

export const getWellKnownConfig = cache(async (): Promise<WellKnownConfig> => {
  const cachedConfig = await getCache<WellKnownConfig>(CACHE_KEY);
  if (cachedConfig) {
    logger.debug('Returning well-known config from cache.');
    return cachedConfig;
  }

  logger.info('Fetching fresh well-known OIDC configuration.');

  const wellknownUrl = process.env.NEXT_PUBLIC_COGNITO_WELLKNOWN;
  if (!wellknownUrl) {
    logger.error('NEXT_PUBLIC_COGNITO_WELLKNOWN env var is not set.');
    throw new Error('Missing OIDC well-known configuration URL.');
  }

  const response = await fetch(wellknownUrl, {
    // We can use Next.js's fetch cache here for resilience,
    // but our primary cache is Redis/KV for longer-term storage.
    next: { revalidate: CACHE_TTL_SECONDS },
  });

  if (!response.ok) {
    logger.error('Failed to fetch OpenID configuration from provider.');
    throw new Error('Failed to fetch OpenID configuration from provider.');
  }

  const config: WellKnownConfig = await response.json();

  await setCache(CACHE_KEY, config, CACHE_TTL_SECONDS);

  return config;
});
