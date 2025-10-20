import Redis from 'ioredis';

const globalForRedis = globalThis as unknown as {
  redis?: Redis;
};

// Redis Cloud configuration
const createRedisClient = () => {
  // If REDIS_URL is provided (Redis Cloud format), use it directly
  if (process.env.REDIS_URL) {
    return new Redis(process.env.REDIS_URL, {
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      // Connection pooling for production
      ...(process.env.NODE_ENV === 'production' && {
        maxRetriesPerRequest: 3,
        retryDelayOnFailover: 100,
        enableReadyCheck: false,
        maxLoadingTimeout: 1000,
      }),
    });
  }

  // Fallback to individual connection parameters
  return new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    // Connection pooling for production
    ...(process.env.NODE_ENV === 'production' && {
      maxRetriesPerRequest: 3,
      retryDelayOnFailover: 100,
      enableReadyCheck: false,
      maxLoadingTimeout: 1000,
    }),
  });
};

export const redis = globalForRedis.redis || createRedisClient();

if (process.env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis;
}

// Graceful shutdown
process.on('SIGINT', () => {
  redis.disconnect();
});

process.on('SIGTERM', () => {
  redis.disconnect();
});