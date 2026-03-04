import Redis from 'ioredis';

// Parse REDIS_URL if provided (Render KV Store format), otherwise use individual variables
const getRedisConfig = () => {
  if (process.env.REDIS_URL) {
    console.log('📍 Using REDIS_URL from environment');
    return process.env.REDIS_URL;
  }
  
  // Fallback to individual host/port/password
  return {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    ...(process.env.REDIS_SSL === 'true' && { tls: {} })
  };
};

export const redisClient = new Redis(getRedisConfig(), {
  retryStrategy: (times) => {
    // Don't retry forever if Redis is optional
    if (times > 10) {
      console.warn('⚠️  Redis unavailable after 10 attempts - features will be limited');
      return -1; // Stop retrying
    }
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  enableReadyCheck: false,
  enableOfflineQueue: false
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
