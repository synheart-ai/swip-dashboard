import { NextRequest } from 'next/server';
import { validateSwipInternalKey } from './auth-swip';
import { validateDeveloperApiKey } from './auth-developer-key';
import { isSwipApp, isVerifiedApp, getSwipAppId } from './verified-apps';
import { logger } from './logger';

export interface IngestionAuthResult {
  valid: boolean;
  error?: string;
  isSwipApp?: boolean;
  appId?: string;  // External app ID (appId field from App model)
  userId?: string;
}

/**
 * Validates authentication for data ingestion endpoints
 * Supports both:
 * 1. SWIP internal key (optional - for Swip app - can ingest any app data)
 * 2. Developer API key (for verified wellness apps - can only ingest their own app data)
 * 
 * @param req - Next.js request object
 * @param bodyAppId - Optional app_id from request body to verify against API key's app_id
 * @returns IngestionAuthResult with validation status and app info
 */
export async function validateIngestionAuth(req: NextRequest, bodyAppId?: string): Promise<IngestionAuthResult> {
  // First, try SWIP internal key (optional)
  const isSwipInternalKey = await validateSwipInternalKey(req);
  
  if (isSwipInternalKey) {
    logger.info('Ingestion auth: SWIP internal key validated', {
      path: req.nextUrl.pathname,
    });
    return {
      valid: true,
      isSwipApp: true,
      appId: await getSwipAppId(),
    };
  }

  // If not SWIP internal key, try developer API key
  const apiKeyAuth = await validateDeveloperApiKey(req);
  
  if (!apiKeyAuth.valid) {
    return {
      valid: false,
      error: apiKeyAuth.error || 'Unauthorized: Invalid or missing authentication',
    };
  }

  // Check if API key has an associated app
  if (!apiKeyAuth.apiKey?.appExternalId) {
    logger.warn('API key has no associated app', {
      keyId: apiKeyAuth.apiKey?.id,
      path: req.nextUrl.pathname,
    });
    return {
      valid: false,
      error: 'API key is not associated with an app',
    };
  }

  const appExternalId = apiKeyAuth.apiKey.appExternalId;

  // If bodyAppId is provided, verify it matches the API key's app_id
  if (bodyAppId && bodyAppId !== appExternalId) {
    logger.warn('App ID mismatch between API key and request body', {
      apiKeyAppId: appExternalId,
      bodyAppId: bodyAppId,
      path: req.nextUrl.pathname,
    });
    return {
      valid: false,
      error: `App ID mismatch: API key is for app ${appExternalId}, but request body specifies app ${bodyAppId}. Apps can only ingest data for their own app.`,
    };
  }

  // Verify the app is in the verified apps list
  if (!(await isVerifiedApp(appExternalId))) {
    logger.warn('App not in verified apps list', {
      appId: appExternalId,
      path: req.nextUrl.pathname,
    });
    return {
      valid: false,
      error: `App ${appExternalId} is not verified for data ingestion`,
    };
  }

  // Check if it's the Swip app
  const isSwip = await isSwipApp(appExternalId);

  logger.info('Ingestion auth: Developer API key validated', {
    appId: appExternalId,
    isSwipApp: isSwip,
    userId: apiKeyAuth.userId,
    path: req.nextUrl.pathname,
  });

  return {
    valid: true,
    isSwipApp: isSwip,
    appId: appExternalId,
    userId: apiKeyAuth.userId,
  };
}

/**
 * Verify that the app ID in the data matches the authenticated app ID
 * For Swip app: no verification needed (can ingest any app data)
 * For other apps: app ID in data must match the API key's app ID
 * 
 * @param authResult - Result from validateIngestionAuth
 * @param dataAppId - App ID from the data being ingested
 * @returns true if verification passes, false otherwise
 */
export function verifyAppIdMatch(
  authResult: IngestionAuthResult,
  dataAppId: string
): { valid: boolean; error?: string } {
  // Swip app can ingest data for any app
  if (authResult.isSwipApp) {
    return { valid: true };
  }

  // For other apps, the app ID in data must match the API key's app ID
  if (authResult.appId !== dataAppId) {
    return {
      valid: false,
      error: `App ID mismatch: API key is for app ${authResult.appId}, but data is for app ${dataAppId}. Apps can only ingest data for their own app.`,
    };
  }

  return { valid: true };
}

