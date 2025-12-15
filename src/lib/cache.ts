import { redis } from './redis';
import { logger } from './logger';

const cacheClient = redis;

export function isCacheAvailable(): boolean {
  return !!cacheClient;
}

export async function getCachedJson<T>(key: string): Promise<T | null> {
  if (!cacheClient) {
    return null;
  }

  try {
    const raw = await cacheClient.get(key);
    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as T;
  } catch (error) {
    logger.warn('Cache get failed', { key, error });
    return null;
  }
}

export async function setCachedJson(
  key: string,
  value: unknown,
  ttlSeconds: number,
): Promise<void> {
  if (!cacheClient) {
    return;
  }

  try {
    await cacheClient.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  } catch (error) {
    logger.warn('Cache set failed', { key, error });
  }
}

export async function deleteCacheKey(key: string): Promise<void> {
  if (!cacheClient) {
    return;
  }

  try {
    await cacheClient.del(key);
  } catch (error) {
    logger.warn('Cache delete failed', { key, error });
  }
}


