import { readFile } from 'fs/promises';
import { join } from 'path';
import { logger } from './logger';

interface VerifiedAppsConfig {
  swip_app_id: string;
  verified_apps: string[];
}

const VERIFIED_APPS_CACHE_KEY = 'verified-apps:config';
const VERIFIED_APPS_CACHE_TTL_SECONDS = 5 * 60; // 5 minutes

const DEFAULT_CONFIG: VerifiedAppsConfig = {
  swip_app_id: 'ai.synheart.swip',
  verified_apps: ['ai.synheart.swip'],
};

let verifiedAppsCache: VerifiedAppsConfig | null = null;

let redisClient: any = null;
try {
  const redisModule = require('./redis');
  redisClient = redisModule.redis;
} catch (error) {
  logger.info('Redis not configured for verified apps cache. Falling back to local cache only.');
}

/**
 * Load verified apps configuration from JSON file
 */
async function loadConfigFromFile(): Promise<VerifiedAppsConfig> {
  try {
    const configPath = join(process.cwd(), 'verified-apps.json');
    const fileContent = await readFile(configPath, 'utf-8');
    const config = JSON.parse(fileContent) as VerifiedAppsConfig;
    logger.info('Verified apps loaded from file', {
      swipAppId: config.swip_app_id,
      verifiedCount: config.verified_apps.length,
    });
    return config;
  } catch (error) {
    logger.error('Failed to load verified-apps.json, using default configuration', { error });
    return DEFAULT_CONFIG;
  }
}

async function cacheConfig(config: VerifiedAppsConfig): Promise<void> {
  verifiedAppsCache = config;

  if (!redisClient) {
    return;
  }

  try {
    await redisClient.set(
      VERIFIED_APPS_CACHE_KEY,
      JSON.stringify(config),
      'EX',
      VERIFIED_APPS_CACHE_TTL_SECONDS,
    );
  } catch (error) {
    logger.warn('Failed to write verified apps to Redis cache', { error });
  }
}

async function loadConfigFromRedis(): Promise<VerifiedAppsConfig | null> {
  if (!redisClient) {
    return null;
  }

  try {
    const cached = await redisClient.get(VERIFIED_APPS_CACHE_KEY);
    if (!cached) {
      return null;
    }

    const config = JSON.parse(cached) as VerifiedAppsConfig;
    verifiedAppsCache = config;
    logger.info('Verified apps loaded from Redis cache', {
      swipAppId: config.swip_app_id,
      verifiedCount: config.verified_apps.length,
    });
    return config;
  } catch (error) {
    logger.warn('Failed to read verified apps from Redis cache', { error });
    return null;
  }
}

async function loadVerifiedApps(forceFile = false): Promise<VerifiedAppsConfig> {
  if (verifiedAppsCache && !forceFile) {
    return verifiedAppsCache;
  }

  if (!forceFile) {
    const cached = await loadConfigFromRedis();
    if (cached) {
      return cached;
    }
  }

  const config = await loadConfigFromFile();
  await cacheConfig(config);
  return config;
}

/**
 * Check if an app ID is the Swip app
 */
export async function isSwipApp(appId: string): Promise<boolean> {
  let config = await loadVerifiedApps();
  if (appId === config.swip_app_id) {
    return true;
  }

  config = await reloadVerifiedApps();
  return appId === config.swip_app_id;
}

/**
 * Check if an app ID is in the verified apps list
 */
export async function isVerifiedApp(appId: string): Promise<boolean> {
  let config = await loadVerifiedApps();
  if (config.verified_apps.includes(appId)) {
    return true;
  }

  config = await reloadVerifiedApps();
  return config.verified_apps.includes(appId);
}

/**
 * Get the Swip app ID
 */
export async function getSwipAppId(): Promise<string> {
  const config = await loadVerifiedApps();
  return config.swip_app_id;
}

/**
 * Get all verified app IDs
 */
export async function getVerifiedAppIds(): Promise<string[]> {
  const config = await loadVerifiedApps();
  return [...config.verified_apps];
}

/**
 * Reload verified apps (useful for testing or when config changes)
 */
export async function reloadVerifiedApps(): Promise<VerifiedAppsConfig> {
  verifiedAppsCache = null;

  if (redisClient) {
    try {
      await redisClient.del(VERIFIED_APPS_CACHE_KEY);
    } catch (error) {
      logger.warn('Failed to delete verified apps cache key from Redis', { error });
    }
  }

  logger.info('Reloading verified apps configuration from source');
  return loadVerifiedApps(true);
}

