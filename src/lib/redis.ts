import 'server-only';
import Redis from 'ioredis';

if (!process.env.REDIS_URL) {
  throw new Error('REDIS_URL is not set in environment variables');
}

// Create a new Redis client instance.
const redis = new Redis(process.env.REDIS_URL, {
    // Adding a maxRetriesPerRequest of null is important to prevent ioredis
    // from infinitely retrying a command and hanging the server response.
    maxRetriesPerRequest: null,
});

redis.on('error', (err) => console.error('Redis Client Error', err));

// Export the client for use in other parts of the application.
export { redis };
