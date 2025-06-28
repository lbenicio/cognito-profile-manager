import 'server-only';
import { createClient, type RedisClientType } from 'redis';

const REDIS_URL = process.env.REDIS_URL;
const LOG_CONTEXT = 'RedisService';

// Singleton pattern for the Redis client
let redisClientInstance: RedisClientType | null = null;

function getRedisClient(): RedisClientType | null {
  if (redisClientInstance) {
    return redisClientInstance;
  }

  if (!REDIS_URL) {
    console.warn('REDIS_URL not defined. Redis caching is disabled.');
    return null;
  }

  try {
    const client = createClient({
      url: REDIS_URL,
      socket: {
        connectTimeout: 5000,
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            return new Error('Too many retries for Redis connection.');
          }
          return Math.min(retries * 200, 3000);
        },
      },
    });

    client.on('error', (err) => console.error(`${LOG_CONTEXT} Error:`, err));
    client.on('connect', () => console.info(`${LOG_CONTEXT}: Connecting...`));
    client.on('ready', () => console.info(`${LOG_CONTEXT}: Client is ready.`));
    client.on('reconnecting', () =>
      console.info(`${LOG_CONTEXT}: Reconnecting...`)
    );

    redisClientInstance = client;
    return redisClientInstance;
  } catch (error) {
    console.error('Failed to initialize Redis client:', error);
    return null;
  }
}

// Initialize on module load
const redis = getRedisClient();

async function ensureConnected(): Promise<boolean> {
  if (!redis) {
    return false;
  }

  if (redis.isReady) {
    return true;
  }

  // The redis client `connect` method throws an error if it's already connected.
  // We should only call it if the client's socket is not open.
  if (!redis.isOpen) {
    try {
      await redis.connect();
    } catch (err) {
      // This catch block handles errors during the initial connection attempt.
      // It's possible another request initiated the connection in the meantime.
      if (
        err instanceof Error &&
        (err.message.includes('Socket already opened') ||
          err.message.includes('already connected'))
      ) {
        // This is a recoverable race condition. We can proceed.
      } else {
        console.error(
          `${LOG_CONTEXT}: Connection failed on redis.connect():`,
          err
        );
        return false;
      }
    }
  }

  // After attempting to connect (if needed), we return the current ready state.
  // If it was already in the process of connecting, `isReady` will be false for this request.
  // The functions using this will then fail gracefully (e.g., return null from cache).
  return redis.isReady;
}

export async function getCache<T>(key: string): Promise<T | null> {
  const connected = await ensureConnected();
  if (!connected) {
    console.debug(`getCache(${key}): Redis not connected or disabled.`);
    return null;
  }
  try {
    const data = await redis!.get(key);
    if (data) {
      return JSON.parse(data) as T;
    }
    return null;
  } catch (error) {
    console.error(`Error getting cache for key ${key}:`, error);
    return null;
  }
}

export async function setCache<T>(
  key: string,
  value: T,
  ttlSeconds: number = 3600
): Promise<void> {
  const connected = await ensureConnected();
  if (!connected) {
    console.debug(`setCache(${key}): Redis not connected or disabled.`);
    return;
  }
  try {
    await redis!.set(key, JSON.stringify(value), { EX: ttlSeconds });
  } catch (error) {
    console.error(`Error setting cache for key ${key}:`, error);
  }
}

export async function deleteCache(key: string | string[]): Promise<void> {
  const connected = await ensureConnected();
  if (!connected) {
    console.debug(
      `deleteCache(${Array.isArray(key) ? key.join(', ') : key}): Redis not ready or disabled.`
    );
    return;
  }
  try {
    const keysToDelete = Array.isArray(key) ? key : [key];
    if (keysToDelete.length === 0) return;
    await redis!.del(keysToDelete);
  } catch (error) {
    const keysStr = Array.isArray(key) ? key.join(', ') : key;
    console.error(`Error deleting cache for key(s) ${keysStr}:`, error);
  }
}

export { redis };
