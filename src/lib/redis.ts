import Redis from 'ioredis';

const globalForRedis = globalThis as unknown as {
  redis?: Redis | null;
};

// Redis configuration for ElastiCache and Redis Cloud
const createRedisClient = (): Redis | null => {
  // Only create Redis client if REDIS_URL is explicitly provided
  if (!process.env.REDIS_URL) {
    console.log('⚠️  REDIS_URL not configured, Redis caching disabled');
    return null;
  }

  try {
    const client = new Redis(process.env.REDIS_URL, {
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      // Connection pooling for production
      ...(process.env.NODE_ENV === 'production' && {
        maxRetriesPerRequest: 3,
        retryDelayOnFailover: 100,
        enableReadyCheck: false,
        maxLoadingTimeout: 1000,
        // ElastiCache specific optimizations
        connectTimeout: 10000,
        commandTimeout: 5000,
        keepAlive: 30000,
      }),
    });

    // Suppress error events to avoid unhandled error warnings
    client.on('error', (error) => {
      console.error('⚠️  Redis connection error (continuing without cache):', error.message);
    });

    console.log('✅ Redis client created successfully');
    return client;
  } catch (error) {
    console.error('⚠️  Failed to create Redis client:', error);
    return null;
  }
};

export const redis = globalForRedis.redis !== undefined ? globalForRedis.redis : createRedisClient();

if (process.env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis;
}

// Graceful shutdown
process.on('SIGINT', () => {
  if (redis) redis.disconnect();
});

process.on('SIGTERM', () => {
  if (redis) redis.disconnect();
});