import 'server-only';
import Redis from 'ioredis';

export type RedisClient = Redis;

// Cache the client in dev to avoid creating multiple connections after HMR.
declare global {
  // eslint-disable-next-line no-var
  var __redis__: RedisClient | null | undefined;
}

function createClient(): RedisClient | null {
  const url = process.env.REDIS_URL;
  if (!url) {
    console.warn('REDIS_URL not configured. Redis disabled.');
    return null;
  }

  const client = new Redis(url, {
    // Do not open a socket until we actually use it.
    lazyConnect: true,

    // Conservative retry behavior so functions fail fast if Redis is down.
    maxRetriesPerRequest: 3,
    retryDelayOnFailover: 100,

    // Production hardening (safe for ElastiCache/Redis Cloud).
    ...(process.env.NODE_ENV === 'production' && {
      enableReadyCheck: false,
      maxLoadingTimeout: 1_000,
      connectTimeout: 10_000,
      commandTimeout: 5_000,
      keepAlive: 30_000,
    }),
  });

  // Don’t crash the process on errors; we can run without cache.
  client.on('error', (err) => {
    console.error('Redis error (continuing without cache):', err?.message ?? err);
  });

  return client;
}

// Use a single instance across reloads in dev.
const _client = global.__redis__ ?? createClient();

if (process.env.NODE_ENV !== 'production') {
  global.__redis__ = _client ?? null;
}

/**
 * Nullable client. Callers MUST narrow before use:
 *   if (redis) { await redis.connect(); await redis.ping(); }
 *
 * Note: ioredis is NOT Edge-compatible. Any route importing this file
 * must set `export const runtime = 'nodejs'`.
 */
export const redis: RedisClient | null = _client;

/**
 * Optional helper if you prefer a guarded, ready-to-use client.
 * It throws if REDIS_URL is missing.
 */
export async function getConnectedRedis(): Promise<RedisClient> {
  if (!redis) {
    throw new Error('Redis is disabled: REDIS_URL not configured');
  }
  // With lazyConnect, ensure an active socket before first command.
  // Accept typical non-connected states: 'end', 'close', 'wait'
  // (status values are internal; this is a pragmatic check).
  if ((redis as any).status !== 'ready') {
    await redis.connect();
  }
  return redis;
}