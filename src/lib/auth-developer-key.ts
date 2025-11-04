import { NextRequest } from 'next/server';
import { createHash } from 'crypto';
import { prisma } from './db';
import { logger } from './logger';

export interface DeveloperAuthResult {
  valid: boolean;
  error?: string;
  userId?: string;
  appIds?: string[];
  apiKey?: {
    id: string;
    preview: string;
    appId: string | null;
  };
}

/**
 * Validates a developer API key
 * Used for read-only access to claimed app data
 * 
 * @param req - Next.js request object
 * @returns DeveloperAuthResult with validation status and user info
 */
export async function validateDeveloperApiKey(req: NextRequest): Promise<DeveloperAuthResult> {
  const key = req.headers.get('x-api-key');

  // Check if key is provided
  if (!key) {
    return { 
      valid: false, 
      error: 'Missing API key. Please provide x-api-key header.' 
    };
  }

  // Validate key format (should start with swip_key_)
  if (!key.startsWith('swip_key_')) {
    return { 
      valid: false, 
      error: 'Invalid API key format. Key should start with swip_key_' 
    };
  }

  try {
    // Create SHA-256 hash for lookup (fast index lookup)
    const lookupHash = createHash('sha256').update(key).digest('hex');

    // Find API key in database
    const apiKey = await prisma.apiKey.findUnique({
      where: { lookupHash },
      include: { 
        user: {
          include: {
            apps: {
              where: {
                claimable: false, // Only include claimed apps
              },
              select: {
                id: true,
              }
            }
          }
        }
      }
    });

    // Check if API key exists
    if (!apiKey) {
      logger.warn('API key not found', {
        keyPreview: key.substring(0, 20) + '...',
        path: req.nextUrl.pathname,
      });
      return { 
        valid: false, 
        error: 'Invalid API key' 
      };
    }

    // Check if API key is revoked
    if (apiKey.revoked) {
      logger.warn('Revoked API key used', {
        keyId: apiKey.id,
        userId: apiKey.userId,
        path: req.nextUrl.pathname,
      });
      return { 
        valid: false, 
        error: 'API key has been revoked' 
      };
    }

    // Update last used timestamp (don't await to avoid blocking)
    prisma.apiKey.update({
      where: { id: apiKey.id },
      data: { lastUsed: new Date() }
    }).catch(err => {
      logger.error('Failed to update API key last used timestamp', { 
        error: err,
        keyId: apiKey.id 
      });
    });

    // Get list of app IDs the user can access (only claimed apps)
    const appIds = apiKey.user.apps.map(app => app.id);

    logger.info('Developer API key validated', {
      keyId: apiKey.id,
      userId: apiKey.user.id,
      appCount: appIds.length,
      path: req.nextUrl.pathname,
    });

    return {
      valid: true,
      userId: apiKey.user.id,
      appIds,
      apiKey: {
        id: apiKey.id,
        preview: apiKey.preview,
        appId: apiKey.appId,
      }
    };
  } catch (error) {
    logger.error('Error validating developer API key', { 
      error,
      path: req.nextUrl.pathname,
    });
    return { 
      valid: false, 
      error: 'Internal server error validating API key' 
    };
  }
}

/**
 * Helper to check if user can access a specific app
 */
export async function canAccessApp(userId: string, appId: string): Promise<boolean> {
  const app = await prisma.app.findFirst({
    where: {
      id: appId,
      ownerId: userId,
      claimable: false, // Must be claimed
    }
  });

  return !!app;
}

/**
 * Helper to check if user can access a specific session
 */
export async function canAccessSession(userId: string, sessionId: string): Promise<boolean> {
  const session = await prisma.swipSession.findFirst({
    where: {
      id: sessionId,
      app: {
        ownerId: userId,
        claimable: false, // Must be claimed
      }
    }
  });

  return !!session;
}

