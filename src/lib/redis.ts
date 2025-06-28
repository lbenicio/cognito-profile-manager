import 'server-only';
import { createClient } from '@vercel/kv';

if (!process.env.REDIS_URL) {
  throw new Error('REDIS_URL is not set in environment variables');
}

export const redis = createClient({
  url: process.env.REDIS_URL,
});
