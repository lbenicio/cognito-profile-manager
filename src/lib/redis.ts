import 'server-only';
import Redis from 'ioredis';
import { Logger } from '@/lib/logger';

const logger = new Logger('CACHE');

const REDIS_URL = process.env.REDIS_URL;
const LOG_CONTEXT = 'RedisService';

let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (redis) return redis;

  if (!REDIS_URL) {
    logger.warn('REDIS_URL not defined. Redis caching is disabled.');
    return null;
  }

  try {
    redis = new Redis(REDIS_URL);
  } catch (err) {
    logger.error(`${LOG_CONTEXT}: Invalid REDIS_URL format.`, err);
    return null;
  }

  return redis;
}

export async function getCache<T>(key: string): Promise<T | null> {
  const client = getRedis();
  if (!client) {
    logger.debug(`getCache(${key}): Redis not connected or disabled.`);
    return null;
  }

  const result = await client.get(key);
  if (!result) return null;
  return JSON.parse(result) as T;
}

export async function setCache<T>(
  key: string,
  value: T,
  ttlSeconds: number = 3600
): Promise<void> {
  const client = getRedis();
  if (!client) {
    logger.debug(`setCache(${key}): Redis not connected or disabled.`);
    return;
  }
  await client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
}

export async function deleteCache(key: string | string[]): Promise<void> {
  const client = getRedis();
  if (!client) {
    logger.debug(
      `deleteCache(${Array.isArray(key) ? key.join(', ') : key}): Redis not ready or disabled.`
    );
    return;
  }
  const keysToDelete = Array.isArray(key) ? key : [key];
  if (keysToDelete.length === 0) return;
  await client.del(...keysToDelete);
}

export { redis };
