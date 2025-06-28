import 'server-only';
import { createClient } from 'redis';

if (!process.env.REDIS_URL) {
  throw new Error('REDIS_URL is not set in environment variables');
}

// Create a new Redis client instance.
const redisClient = createClient({
    url: process.env.REDIS_URL
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

// The client automatically queues commands until the connection is established.
// We initiate the connection here and log any potential connection errors.
if (!redisClient.isOpen) {
    redisClient.connect().catch(console.error);
}

// Export the client for use in other parts of the application.
export const redis = redisClient;
