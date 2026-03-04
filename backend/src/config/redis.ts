import Redis, { RedisOptions } from 'ioredis';

const redisOptions: RedisOptions = {
  retryStrategy: (times: number) => {
    // Don't retry forever if Redis is optional
    if (times > 10) {
      console.warn('⚠️  Redis unavailable after 10 attempts - features will be limited');
      return -1; // Stop retrying
    }
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  enableReadyCheck: false,
  enableOfflineQueue: false,
  ...(process.env.REDIS_SSL === 'true' && { tls: {} })
};

// If REDIS_URL is provided (Render KV Store), use it; otherwise use individual vars
export const redisClient = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, redisOptions)
  : new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      ...redisOptions
    });

redisClient.on('error', (err) => {
  console.error('❌ Redis error:', err.message);
});

redisClient.on('connect', () => {
  console.log('✅ Redis connected');
});

redisClient.on('reconnecting', () => {
  console.warn('⚠️  Redis reconnecting...');
});

export default redisClient;
