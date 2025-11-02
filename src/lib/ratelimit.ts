import { redis } from "./redis";

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  limit: number;
  resetMs: number;
}

/**
 * Redis-based distributed rate limiter using sliding window algorithm.
 * Suitable for multi-instance production deployments.
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> {
  try {
    const now = Date.now();
    const windowStart = now - windowMs;

    // Use Redis pipeline for atomic operations
    if (!redis) {
      throw new Error("Redis client is not initialized");
    }
    const pipeline = redis.pipeline();

    // Remove expired entries
    pipeline.zremrangebyscore(key, "-inf", windowStart);

    // Count current entries
    pipeline.zcard(key);

    // Add current request
    pipeline.zadd(key, now, `${now}-${Math.random()}`);

    // Set expiration
    pipeline.expire(key, Math.ceil(windowMs / 1000));

    const results = await pipeline.exec();

    if (!results) {
      throw new Error("Redis pipeline execution failed");
    }

    const currentCount = results[1][1] as number;
    const ok = currentCount < limit;

    if (!ok) {
      // Calculate reset time (when oldest entry expires)
      const oldestEntry = await redis.zrange(key, 0, 0, "WITHSCORES");
      const resetMs =
        oldestEntry.length > 0
          ? parseInt(oldestEntry[1]) + windowMs - now
          : windowMs;

      return {
        ok: false,
        remaining: 0,
        limit,
        resetMs: Math.max(0, resetMs),
      };
    }

    return {
      ok: true,
      remaining: limit - currentCount - 1,
      limit,
      resetMs: windowMs,
    };
  } catch (error) {
    console.error("Rate limiting error:", error);
    // Fail open - allow request if Redis is down
    return {
      ok: true,
      remaining: limit - 1,
      limit,
      resetMs: windowMs,
    };
  }
}

export function rateLimitHeaders(result: RateLimitResult) {
  return {
    "x-ratelimit-limit": String(result.limit),
    "x-ratelimit-remaining": String(result.remaining),
    "x-ratelimit-reset": String(result.resetMs),
  } as Record<string, string>;
}

// Health check for Redis
export async function checkRedisHealth(): Promise<boolean> {
  try {
    if (!redis) {
      throw new Error("Redis client is not initialized");
    }
    await redis.ping();
    return true;
  } catch (error) {
    console.error("Redis health check failed:", error);
    return false;
  }
}
