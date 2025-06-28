import 'server-only';
import { createClient } from 'redis';

let redisClient: RedisClientType | null = null;
const REDIS_URL = process.env.REDIS_URL;
let connectionPromise: Promise<void> | null = null;
const LOG_CONTEXT = 'RedisService';

if (REDIS_URL) {
  try {
    redisClient = createClient({
      url: REDIS_URL,
      socket: {
        connectTimeout: 5000,
        reconnectStrategy: (retries: number) => {
          if (retries > 10) {
            logger.warn(
              `Exceeded Redis connection retries (10). Stopping.`,
              LOG_CONTEXT,
            );
            return new Error('Too many retries for Redis connection.');
          }
          const delay = Math.min(retries * 200, 3000);
          logger.info(
            `Redis connection attempt ${retries + 1}. Retrying in ${delay}ms.`,
            LOG_CONTEXT,
          );
          return delay;
        },
      },
    });

    redisClient.on('error', (err) =>
      logger.error('Redis client error:', LOG_CONTEXT, err),
    );
    redisClient.on('connect', () =>
      logger.info('Connecting to Redis...', LOG_CONTEXT),
    );
    redisClient.on('ready', () =>
      logger.info('Redis client is ready.', LOG_CONTEXT),
    );
    redisClient.on('reconnecting', () =>
      logger.info('Redis client is reconnecting...', LOG_CONTEXT),
    );

    // Start connection process immediately and store the promise
    connectionPromise = redisClient.connect().catch((err) => {
      logger.error('Initial Redis connection failed:', LOG_CONTEXT, err);
      // The client will attempt to reconnect based on the strategy.
    });
  } catch (error) {
    logger.error('Failed to initialize Redis client:', LOG_CONTEXT, error);
    redisClient = null;
  }
} else {
  logger.warn('REDIS_URL not defined. Redis caching is disabled.', LOG_CONTEXT);
}

const isReady = (): boolean => !!redisClient && redisClient.isReady;

export async function getCache<T>(key: string): Promise<T | null> {
  if (!isReady()) {
    logger.debug(`getCache(${key}): Redis not ready or disabled.`, LOG_CONTEXT);
    return null;
  }
  try {
    const data = await redisClient!.get(key);
    if (data) {
      logger.debug(`Cache HIT for key: ${key}`, LOG_CONTEXT);
      return JSON.parse(data) as T;
    }
    logger.debug(`Cache MISS for key: ${key}`, LOG_CONTEXT);
    return null;
  } catch (error) {
    logger.error(`Error getting cache for key ${key}:`, LOG_CONTEXT, error);
    return null;
  }
}

export async function setCache<T>(
  key: string,
  value: T,
  ttlSeconds: number = 3600,
): Promise<void> {
  if (!isReady()) {
    logger.debug(`setCache(${key}): Redis not ready or disabled.`, LOG_CONTEXT);
    return;
  }
  try {
    await redisClient!.set(key, JSON.stringify(value), { EX: ttlSeconds });
    logger.debug(
      `Cache SET for key: ${key} (TTL: ${ttlSeconds}s)`,
      LOG_CONTEXT,
    );
  } catch (error) {
    logger.error(`Error setting cache for key ${key}:`, LOG_CONTEXT, error);
  }
}

export async function deleteCache(key: string | string[]): Promise<void> {
  if (!isReady()) {
    logger.debug(
      `deleteCache(${Array.isArray(key) ? key.join(', ') : key}): Redis not ready or disabled.`,
      LOG_CONTEXT,
    );
    return;
  }
  try {
    const keysToDelete = Array.isArray(key) ? key : [key];
    if (keysToDelete.length === 0) return;
    const result = await redisClient!.del(keysToDelete);
    logger.debug(
      `Cache DELETED for key(s): ${keysToDelete.join(', ')}. Count: ${result}`,
      LOG_CONTEXT,
    );
  } catch (error) {
    const keysStr = Array.isArray(key) ? key.join(', ') : key;
    logger.error(
      `Error deleting cache for key(s) ${keysStr}:`,
      LOG_CONTEXT,
      error,
    );
  }
}

// Export the client for use in other parts of the application.
export const redis = redisClient;
