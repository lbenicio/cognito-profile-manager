import 'server-only';
import { kv } from '@vercel/kv';

const LOG_CONTEXT = 'VercelKVService';

// Check if Vercel KV environment variables are set.
const isKvEnabled =
  process.env.KV_URL && process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN;

if (!isKvEnabled) {
  console.warn(`${LOG_CONTEXT}: Environment variables not found. KV is disabled.`);
}

export async function getCache<T>(key: string): Promise<T | null> {
  if (!isKvEnabled) {
    console.debug(`getCache(${key}): KV is disabled.`);
    return null;
  }
  try {
    const data = await kv.get<T>(key);
    return data;
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
  if (!isKvEnabled) {
    console.debug(`setCache(${key}): KV is disabled.`);
    return;
  }
  try {
    await kv.set(key, value, { ex: ttlSeconds });
  } catch (error) {
    console.error(`Error setting cache for key ${key}:`, error);
  }
}

export async function deleteCache(key: string | string[]): Promise<void> {
  if (!isKvEnabled) {
    console.debug(`deleteCache(${Array.isArray(key) ? key.join(', ') : key}): KV is disabled.`);
    return;
  }
  try {
    const keysToDelete = Array.isArray(key) ? key : [key];
    if (keysToDelete.length > 0) {
      await kv.del(...keysToDelete);
    }
  } catch (error) {
    const keysStr = Array.isArray(key) ? key.join(', ') : key;
    console.error(`Error deleting cache for key(s) ${keysStr}:`, error);
  }
}
