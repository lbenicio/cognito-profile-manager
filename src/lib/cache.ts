'use server';
import 'server-only';
import { kv } from '@vercel/kv';
import Redis from 'ioredis';
import { Logger } from '@/lib/logger';

const logger = new Logger('CACHE');

/**
 * The standard interface that all cache clients must implement.
 */
interface CacheClient {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
  del(keys: string | string[]): Promise<number>;
  ping(): Promise<{ status: 'ok' | 'error'; message: string }>;
}

/**
 * A no-op cache client that does nothing. Used when caching is disabled.
 */
class NoOpCache implements CacheClient {
  constructor() {
    logger.info('No-op cache client initialized. Caching is disabled.');
  }
  async get<T>(): Promise<T | null> {
    return null;
  }
  async set<T>(): Promise<void> {}
  async del(): Promise<number> {
    return 0;
  }
  async ping(): Promise<{ status: 'ok' | 'error'; message: string }> {
    return { status: 'ok', message: 'No-op cache is active.' };
  }
}

/**
 * Cache client for Redis.
 */
class RedisCache implements CacheClient {
  private client: Redis;

  constructor(url: string) {
    try {
      this.client = new Redis(url);
      logger.info('Redis cache client initialized.');
    } catch (err) {
      logger.error('Failed to initialize Redis client. Caching may fail.', err);
      throw new Error('Invalid REDIS_URL format.');
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const result = await this.client.get(key);
    return result ? (JSON.parse(result) as T) : null;
  }

  async set<T>(key: string, value: T, ttlSeconds = 3600): Promise<void> {
    await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  }

  async del(keys: string | string[]): Promise<number> {
    const keysToDelete = Array.isArray(keys) ? keys : [keys];
    if (keysToDelete.length === 0) return 0;
    return this.client.del(...keysToDelete);
  }

  async ping(): Promise<{ status: 'ok' | 'error'; message: string }> {
    try {
      const result = await this.client.ping();
      if (result === 'PONG') {
        return { status: 'ok', message: 'Redis connection successful.' };
      }
      return {
        status: 'error',
        message: `Unexpected ping response: ${result}`,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown Redis error';
      return { status: 'error', message };
    }
  }
}

/**
 * Cache client for Vercel KV.
 */
class VercelKVCache implements CacheClient {
  private client = kv;

  constructor() {
    logger.info('Vercel KV cache client initialized.');
  }

  async get<T>(key: string): Promise<T | null> {
    return this.client.get<T>(key);
  }

  async set<T>(key: string, value: T, ttlSeconds = 3600): Promise<void> {
    await this.client.set(key, value, { ex: ttlSeconds });
  }

  async del(keys: string | string[]): Promise<number> {
    const keysToDelete = Array.isArray(keys) ? keys : [keys];
    if (keysToDelete.length === 0) return 0;
    return this.client.del(...keysToDelete);
  }

  async ping(): Promise<{ status: 'ok' | 'error'; message: string }> {
    try {
      const testKey = 'healthcheck_ping';
      await this.client.set(testKey, 'ok', { ex: 5 });
      const result = await this.client.get(testKey);
      if (result === 'ok') {
        return { status: 'ok', message: 'Vercel KV connection successful.' };
      }
      return { status: 'error', message: 'Vercel KV ping failed.' };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown Vercel KV error';
      return { status: 'error', message };
    }
  }
}

/**
 * Cache client for Cloudflare KV.
 */
class CloudflareKVCache implements CacheClient {
  private accountId: string;
  private namespaceId: string;
  private apiToken: string;
  private baseUrl: string;

  constructor() {
    this.accountId = process.env.CLOUDFLARE_ACCOUNT_ID!;
    this.namespaceId = process.env.CLOUDFLARE_KV_NAMESPACE_ID!;
    this.apiToken = process.env.CLOUDFLARE_API_TOKEN!;
    this.baseUrl = `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/storage/kv/namespaces/${this.namespaceId}`;
    logger.info('Cloudflare KV cache client initialized.');
  }

  private async request(
    path: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const url = `${this.baseUrl}${path}`;
    const headers = {
      Authorization: `Bearer ${this.apiToken}`,
      ...options.headers,
    };
    return fetch(url, { ...options, headers });
  }

  async get<T>(key: string): Promise<T | null> {
    const response = await this.request(`/values/${key}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Cloudflare KV GET failed: ${response.statusText}`);
    }
    return response.json() as Promise<T>;
  }

  async set<T>(key: string, value: T, ttlSeconds = 3600): Promise<void> {
    const url = `/values/${key}?expiration_ttl=${ttlSeconds}`;
    const response = await this.request(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(value),
    });
    if (!response.ok) {
      throw new Error(`Cloudflare KV SET failed: ${response.statusText}`);
    }
  }

  async del(keys: string | string[]): Promise<number> {
    const keysToDelete = Array.isArray(keys) ? keys : [keys];
    // Cloudflare KV API for bulk delete accepts up to 10,000 keys
    const response = await this.request('/bulk', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(keysToDelete),
    });
    if (!response.ok) {
      throw new Error(`Cloudflare KV DEL failed: ${response.statusText}`);
    }
    return keysToDelete.length; // Note: This is an assumption; API returns success boolean.
  }

  async ping(): Promise<{ status: 'ok' | 'error'; message: string }> {
    try {
      const response = await this.request(`/keys/healthcheck_ping`);
      if (response.ok || response.status === 404) {
        return { status: 'ok', message: 'Cloudflare KV API is reachable.' };
      }
      return {
        status: 'error',
        message: `Cloudflare KV API returned status ${response.status}.`,
      };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unknown Cloudflare KV error';
      return { status: 'error', message };
    }
  }
}

// Singleton instance of the cache client
let cacheInstance: CacheClient;

/**
 * Factory function to get the appropriate cache client based on environment variables.
 */
function getCacheClient(): CacheClient {
  if (cacheInstance) {
    return cacheInstance;
  }

  const provider = process.env.CACHE_PROVIDER || 'redis';

  switch (provider) {
    case 'vercel_kv':
      if (process.env.KV_URL && process.env.KV_REST_API_TOKEN) {
        cacheInstance = new VercelKVCache();
      } else {
        throw new Error(
          'CACHE_PROVIDER is "vercel_kv" but KV_URL or KV_REST_API_TOKEN is missing.'
        );
      }
      break;

    case 'cloudflare_kv':
      if (
        process.env.CLOUDFLARE_ACCOUNT_ID &&
        process.env.CLOUDFLARE_KV_NAMESPACE_ID &&
        process.env.CLOUDFLARE_API_TOKEN
      ) {
        cacheInstance = new CloudflareKVCache();
      } else {
        throw new Error(
          'CACHE_PROVIDER is "cloudflare_kv" but one or more required Cloudflare environment variables are missing.'
        );
      }
      break;

    case 'redis':
      if (process.env.REDIS_URL) {
        cacheInstance = new RedisCache(process.env.REDIS_URL);
      } else {
        throw new Error(
          'CACHE_PROVIDER is set to "redis" but REDIS_URL is missing from environment variables.'
        );
      }
      break;

    default:
      logger.warn(
        `Unknown or disabled CACHE_PROVIDER "${provider}". Caching will be non-functional.`
      );
      cacheInstance = new NoOpCache();
      break;
  }

  return cacheInstance;
}

// --- Public API ---
export async function getCache<T>(key: string): Promise<T | null> {
  const client = getCacheClient();
  return client.get<T>(key);
}

export async function setCache<T>(
  key: string,
  value: T,
  ttlSeconds?: number
): Promise<void> {
  const client = getCacheClient();
  await client.set(key, value, ttlSeconds);
}

export async function delCache(keys: string | string[]): Promise<number> {
  const client = getCacheClient();
  return client.del(keys);
}

export async function pingCache(): Promise<{
  status: 'ok' | 'error';
  message: string;
}> {
  const client = getCacheClient();
  return client.ping();
}
