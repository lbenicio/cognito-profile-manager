import 'server-only';
import { createClient, RedisClientType } from 'redis';

let redisClient: RedisClientType | null = null;
const REDIS_URL = process.env.REDIS_URL;
let connectionPromise = null;
const LOG_CONTEXT = 'RedisService';

if (REDIS_URL) {
  try {
    redisClient = createClient({
      url: REDIS_URL,
      socket: {
        connectTimeout: 5000,
        reconnectStrategy: (retries: number) => {
          if (retries > 10) {
            console.warn(`Exceeded Redis connection retries (10). Stopping.`);
            return new Error('Too many retries for Redis connection.');
          }
          const delay = Math.min(retries * 200, 3000);
          console.info(
            `Redis connection attempt ${retries + 1}. Retrying in ${delay}ms.`,
            LOG_CONTEXT
          );
          return delay;
        },
      },
    });

    redisClient.on('error', (err) => console.error('Redis client error:', err));
    redisClient.on('connect', () => console.info('Connecting to Redis...'));
    redisClient.on('ready', () => console.info('Redis client is ready.'));
    redisClient.on('reconnecting', () =>
      console.info('Redis client is reconnecting...')
    );

    // Start connection process immediately and store the promise
    connectionPromise = redisClient.connect().catch((err) => {
      console.error('Initial Redis connection failed:', err);
      // The client will attempt to reconnect based on the strategy.
    });
  } catch (error) {
    console.error('Failed to initialize Redis client:', error);
    redisClient = null;
  }
} else {
  console.warn('REDIS_URL not defined. Redis caching is disabled.');
}

const isReady = (): boolean => !!redisClient && redisClient.isReady;

export async function getCache<T>(key: string): Promise<T | null> {
  if (!isReady()) {
    console.debug(`getCache(${key}): Redis not ready or disabled.`);
    return null;
  }
  try {
    const data = await redisClient!.get(key);
    if (data) {
      console.debug(`Cache HIT for key: ${key}`);
      return JSON.parse(data) as T;
    }
    console.debug(`Cache MISS for key: ${key}`);
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
  if (!isReady()) {
    console.debug(`setCache(${key}): Redis not ready or disabled.`);
    return;
  }
  try {
    await redisClient!.set(key, JSON.stringify(value), { EX: ttlSeconds });
    console.debug(
      `Cache SET for key: ${key} (TTL: ${ttlSeconds}s)`,
      LOG_CONTEXT
    );
  } catch (error) {
    console.error(`Error setting cache for key ${key}:`, error);
  }
}

export async function deleteCache(key: string | string[]): Promise<void> {
  if (!isReady()) {
    console.debug(
      `deleteCache(${Array.isArray(key) ? key.join(', ') : key}): Redis not ready or disabled.`,
      LOG_CONTEXT
    );
    return;
  }
  try {
    const keysToDelete = Array.isArray(key) ? key : [key];
    if (keysToDelete.length === 0) return;
    const result = await redisClient!.del(keysToDelete);
    console.debug(
      `Cache DELETED for key(s): ${keysToDelete.join(', ')}. Count: ${result}`,
      LOG_CONTEXT
    );
  } catch (error) {
    const keysStr = Array.isArray(key) ? key.join(', ') : key;
    console.error(
      `Error deleting cache for key(s) ${keysStr}:`,
      LOG_CONTEXT,
      error
    );
  }
}

// Export the client for use in other parts of the application.
export const redis = redisClient;
