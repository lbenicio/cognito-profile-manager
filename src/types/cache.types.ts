export interface CacheClient {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
  del(keys: string | string[]): Promise<number>;
  ping(): Promise<{ status: 'ok' | 'error'; message: string }>;
}
