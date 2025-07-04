'use server';
import 'server-only';
import { Redis } from '@upstash/redis';
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
 * Cache client for Upstash Redis.
 */
class UpstashRedisCache implements CacheClient {
  private client: Redis;

  constructor(url: string, token: string) {
    this.client = new Redis({ url, token });
    logger.info('Upstash Redis cache client initialized.');
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
      const result = await this.client.ping();
      if (result === 'PONG') {
        return {
          status: 'ok',
          message: 'Upstash Redis connection successful.',
        };
      }
      return {
        status: 'error',
        message: `Unexpected ping response: ${result}`,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown Upstash Redis error';
      return { status: 'error', message };
    }
  }
}

/**
 * Initializes the cache client based on environment variables.
 * This function is called once when the module is loaded, ensuring a single client instance.
 */
function initializeCacheClient(): CacheClient {
  const provider = process.env.CACHE_PROVIDER || 'upstash';

  if (provider === 'upstash') {
    const redisUrl = process.env.upstash_KV_REST_API_URL;
    const redisToken = process.env.upstash_KV_REST_API_TOKEN;

    if (redisUrl && redisToken) {
      return new UpstashRedisCache(redisUrl, redisToken);
    }
    logger.warn(
      'CACHE_PROVIDER is "upstash" but upstash_KV_REST_API_URL or upstash_KV_REST_API_TOKEN are missing. Caching is disabled.'
    );
    return new NoOpCache();
  }

  logger.warn(
    `Unsupported CACHE_PROVIDER "${provider}". Caching will be disabled.`
  );
  return new NoOpCache();
}

// Singleton instance of the cache client, initialized once.
const client: CacheClient = initializeCacheClient();

// --- Public API ---
export async function getCache<T>(key: string): Promise<T | null> {
  return client.get<T>(key);
}

export async function setCache<T>(
  key: string,
  value: T,
  ttlSeconds?: number
): Promise<void> {
  await client.set(key, value, ttlSeconds);
}

export async function delCache(keys: string | string[]): Promise<number> {
  return client.del(keys);
}

export async function pingCache(): Promise<{
  status: 'ok' | 'error';
  message: string;
}> {
  return client.ping();
}
