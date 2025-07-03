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

  constructor(url: string) {
    this.client = new Redis({ url });
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
        return { status: 'ok', message: 'Upstash Redis connection successful.' };
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

// Singleton instance of the cache client
let cacheInstance: CacheClient;

/**
 * Factory function to get the appropriate cache client based on environment variables.
 */
function getCacheClient(): CacheClient {
  if (cacheInstance) {
    return cacheInstance;
  }

  const provider = process.env.CACHE_PROVIDER || 'upstash';

  if (provider === 'upstash') {
    if (process.env.UPSTASH_REDIS_URL) {
      cacheInstance = new UpstashRedisCache(process.env.UPSTASH_REDIS_URL);
    } else {
      logger.warn(
        'CACHE_PROVIDER is "upstash" but UPSTASH_REDIS_URL is missing. Caching is disabled.'
      );
      cacheInstance = new NoOpCache();
    }
  } else {
    logger.warn(
      `Unsupported CACHE_PROVIDER "${provider}". Caching will be disabled.`
    );
    cacheInstance = new NoOpCache();
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
