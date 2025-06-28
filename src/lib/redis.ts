import 'server-only';
import RedisPool, { RedisConnectionPoolConfig } from 'redis-connection-pool';

const REDIS_URL = process.env.REDIS_URL;
const LOG_CONTEXT = 'RedisService';

let redisPool: ReturnType<typeof RedisPool> | null = null;

function getRedisPool() {
  if (redisPool) return redisPool;

  if (!REDIS_URL) {
    console.warn('REDIS_URL not defined. Redis caching is disabled.');
    return null;
  }

  // Parse REDIS_URL to extract host, port, and password
  let host: string,
    port: number,
    password: string | undefined,
    database: number;
  try {
    const url = new URL(REDIS_URL);
    host = url.hostname;
    port = Number(url.port) || 6379;
    password = url.password || undefined;
    database =
      url.pathname && url.pathname !== '/'
        ? Number(url.pathname.replace('/', ''))
        : 0;
  } catch (err) {
    console.error(`${LOG_CONTEXT}: Invalid REDIS_URL format.`, err);
    return null;
  }

  const config: RedisConnectionPoolConfig = {
    redis: {
      url: REDIS_URL,
    },
    max_clients: 10, // adjust as needed
    perform_checks: false,
  };

  redisPool = RedisPool('default', config);

  return redisPool;
}

export async function getCache<T>(key: string): Promise<T | null> {
  const pool = await getRedisPool();
  if (!pool) {
    console.debug(`getCache(${key}): Redis not connected or disabled.`);
    return null;
  }

  const result: T = JSON.parse(await pool.get(key));

  return result;
}

export async function setCache<T>(
  key: string,
  value: T,
  ttlSeconds: number = 3600
): Promise<void> {
  const pool = await getRedisPool();
  if (!pool) {
    console.debug(`setCache(${key}): Redis not connected or disabled.`);
    return;
  }
  await pool.set(key, JSON.stringify(value));
  return;
}

export async function deleteCache(key: string | string[]): Promise<void> {
  const pool = await getRedisPool();
  if (!pool) {
    console.debug(
      `deleteCache(${Array.isArray(key) ? key.join(', ') : key}): Redis not ready or disabled.`
    );
    return;
  }
  const keysToDelete = Array.isArray(key) ? key : [key];
  if (keysToDelete.length === 0) return;

  keysToDelete.forEach((k) => {
    pool.del(k);
  });
}

export { redisPool as redis };
