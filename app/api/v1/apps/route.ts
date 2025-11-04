/**
 * SWIP App Integration API - Apps
 * 
 * POST: Protected with SWIP internal key (data ingestion)
 * GET: Protected with developer API key (read-only access)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../src/lib/db';
import { z } from 'zod';
import { logInfo, logError } from '../../../../src/lib/logger';
import { validateSwipInternalKey } from '../../../../src/lib/auth-swip';
import { validateDeveloperApiKey } from '../../../../src/lib/auth-developer-key';

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
 * Create or update an app tracked by SWIP App
 * PROTECTED: Requires SWIP internal API key
 */
export async function POST(request: NextRequest) {
  try {
    // Validate SWIP internal key
    const isValid = await validateSwipInternalKey(request);
    if (!isValid) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Unauthorized: Invalid or missing SWIP internal key',
          message: 'This endpoint requires x-swip-internal-key header'
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const data = CreateAppSchema.parse(body);

    logInfo('SWIP App: Creating/updating app', { appId: data.app_id, name: data.app_name });

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
      logInfo('SWIP App: App updated', { appId: data.app_id });
    } else {
      // Create new app (created by SWIP App, no owner)
      app = await prisma.app.create({
        data: {
          name: data.app_name,
          appId: data.app_id,
          appVersion: data.app_version,
          category: data.category,
          developer: data.developer,
          avgSwipScore: data.app_avg_swip_score,
          createdVia: 'swip_app',
          claimable: true,  // Can be claimed by developers
          ownerId: null  // No owner until claimed
        }
      });
      logInfo('SWIP App: New app created', { appId: data.app_id, id: app.id });
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
    const limit = parseInt(searchParams.get('limit') || '50');

    // Filter to only the developer's claimed apps
    const where: any = {
      ownerId: auth.userId,
      claimable: false  // Only claimed apps
    };
    if (category) where.category = category;

    const apps = await prisma.app.findMany({
      where,
      take: Math.min(limit, 100),
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

    logInfo('Developer API: Apps fetched', { 
      userId: auth.userId, 
      appCount: apps.length 
    });

    return NextResponse.json({
      success: true,
      apps: appsFormatted,
      total: apps.length
    }, {
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

