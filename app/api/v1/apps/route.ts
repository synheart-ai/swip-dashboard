/**
 * SWIP App Integration API - Apps
 * 
 * POST: Protected with SWIP internal key (Swip app) or developer API key (verified wellness apps)
 * GET: Protected with developer API key (read-only access)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../src/lib/db';
import { z } from 'zod';
import { logInfo, logError } from '../../../../src/lib/logger';
import { validateIngestionAuth } from '../../../../src/lib/auth-ingestion';
import { validateDeveloperApiKey } from '../../../../src/lib/auth-developer-key';
import { getCachedJson, setCachedJson, isCacheAvailable } from '../../../../src/lib/cache';

const CreateAppSchema = z.object({
  app_id: z.string().min(1),           // Package name or bundle ID
  app_name: z.string().min(1),         // App display name
  app_version: z.string().optional(),  // App version
  category: z.string().optional(),     // App category
  developer: z.string().optional(),    // Developer name
  app_avg_swip_score: z.number().optional()  // Current avg score
});

/**
 * POST /api/v1/apps
 * 
 * Create or update an app
 * PROTECTED: Requires SWIP internal API key (for Swip app) or developer API key (for verified wellness apps)
 * - Swip app: Can create/update any app
 * - Other verified apps: Can only create/update their own app (app ID must match API key's app ID)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = CreateAppSchema.parse(body);

    // Validate ingestion auth (uses developer API key, with special handling for Swip app ID)
    // Pass app_id from body to verify it matches API key's app_id when x-api-key is used
    const auth = await validateIngestionAuth(request, data.app_id);
    if (!auth.valid) {
      return NextResponse.json(
        { 
          success: false, 
          error: auth.error || 'Unauthorized',
          message: 'This endpoint requires x-api-key header'
        },
        { status: 401 }
      );
    }

    // For non-Swip apps, verify that the app ID in data matches the API key's app ID
    if (!auth.isSwipApp) {
      if (auth.appId !== data.app_id) {
        return NextResponse.json(
          { 
            success: false, 
            error: `App ID mismatch: API key is for app ${auth.appId}, but data is for app ${data.app_id}. Apps can only create/update their own app.`
          },
          { status: 403 }
        );
      }
    }

    logInfo('App ingestion: Creating/updating app', { 
      appId: data.app_id, 
      name: data.app_name,
      isSwipApp: auth.isSwipApp 
    });

    // Check if app already exists (by appId)
    const existingApp = await prisma.app.findFirst({
      where: { appId: data.app_id }
    });

    let app;
    if (existingApp) {
      // Update existing app
      app = await prisma.app.update({
        where: { id: existingApp.id },
        data: {
          name: data.app_name,
          appVersion: data.app_version,
          category: data.category,
          developer: data.developer,
          avgSwipScore: data.app_avg_swip_score,
          updatedAt: new Date()
        }
      });
      logInfo('App ingestion: App updated', { appId: data.app_id });
    } else {
      // Create new app
      // If created by Swip app: no owner, claimable
      // If created by other verified app: owned by the user who created the API key
      app = await prisma.app.create({
        data: {
          name: data.app_name,
          appId: data.app_id,
          appVersion: data.app_version,
          category: data.category,
          developer: data.developer,
          avgSwipScore: data.app_avg_swip_score,
          createdVia: auth.isSwipApp ? 'swip_app' : 'sdk',
          claimable: auth.isSwipApp,  // Only Swip-created apps are claimable
          ownerId: auth.isSwipApp ? null : auth.userId || null
        }
      });
      logInfo('App ingestion: New app created', { 
        appId: data.app_id, 
        id: app.id,
        isSwipApp: auth.isSwipApp 
      });
    }

    return NextResponse.json({
      success: true,
      app: {
        id: app.id,
        app_id: app.appId,
        name: app.name,
        category: app.category,
        avg_swip_score: app.avgSwipScore
      }
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      logError(error, { context: 'v1/apps:POST', details: error.errors });
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    logError(error as Error, { context: 'v1/apps:POST' });
    return NextResponse.json(
      { success: false, error: 'Failed to create/update app' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/v1/apps
 * 
 * List developer's claimed apps with statistics
 * PROTECTED: Requires developer API key
 */
export async function GET(request: NextRequest) {
  try {
    // Validate developer API key
    const auth = await validateDeveloperApiKey(request);
    if (!auth.valid) {
      return NextResponse.json(
        { 
          success: false, 
          error: auth.error || 'Unauthorized',
          message: 'This endpoint requires x-api-key header'
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limitRaw = parseInt(searchParams.get('limit') || '50', 10);
    const limit = Math.min(Math.max(Number.isNaN(limitRaw) ? 50 : limitRaw, 1), 100);

    const cacheKeyBase = `developer:apps:${auth.userId}`;
    const cacheKey = `${cacheKeyBase}:category:${category || 'all'}:limit:${limit}`;

    if (isCacheAvailable()) {
      const cached = await getCachedJson<{ apps: any[]; total: number }>(cacheKey);
      if (cached) {
        logInfo('Developer API: Apps fetched from cache', { userId: auth.userId, appCount: cached.total });
        return NextResponse.json({
          success: true,
          apps: cached.apps,
          total: cached.total,
          cache: 'hit'
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'private, s-maxage=60'
          }
        });
      }
    }

    // Filter to only the developer's claimed apps
    const where: any = {
      ownerId: auth.userId,
      claimable: false  // Only claimed apps
    };
    if (category) where.category = category;

    const apps = await prisma.app.findMany({
      where,
      take: limit,
      orderBy: { avgSwipScore: 'desc' },
      select: {
        id: true,
        appId: true,
        name: true,
        category: true,
        developer: true,
        appVersion: true,
        avgSwipScore: true,
        iconUrl: true,
        createdAt: true,
        _count: {
          select: {
            appSessions: true
          }
        }
      }
    });

    const appsFormatted = apps.map(app => ({
      app_id: app.appId,
      app_name: app.name,
      category: app.category,
      developer: app.developer,
      app_version: app.appVersion,
      app_avg_swip_score: app.avgSwipScore,
      total_sessions: app._count.appSessions,
      icon_url: app.iconUrl,
      created_at: app.createdAt
    }));

    const responsePayload = {
      success: true,
      apps: appsFormatted,
      total: apps.length
    };

    if (isCacheAvailable()) {
      await setCachedJson(cacheKey, { apps: appsFormatted, total: apps.length }, 60);
    }

    logInfo('Developer API: Apps fetched', { 
      userId: auth.userId, 
      appCount: apps.length 
    });

    return NextResponse.json(responsePayload, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'private, s-maxage=60'  // Private cache for developer-specific data
      }
    });
  } catch (error) {
    logError(error as Error, { context: 'v1/apps:GET' });
    return NextResponse.json(
      { success: false, error: 'Failed to fetch apps' },
      { status: 500 }
    );
  }
}

