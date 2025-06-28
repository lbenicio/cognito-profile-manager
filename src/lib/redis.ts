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
  // If the client is created but not connected, try to connect.
  // The client handles the case where it's already connecting or connected.
  try {
    await redis.connect();
    return true;
  } catch (err) {
    // This might catch errors if connect() is called while it's already trying
    // and failing in the background. We can treat this as a failed connection.
    if ((err as Error).message.includes('already connecting')) {
      // Give it a moment to see if it becomes ready
      await new Promise((resolve) => setTimeout(resolve, 100));
      return redis.isReady;
    }
    console.error(`${LOG_CONTEXT}: Connection failed:`, err);
    return false;
  }
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
