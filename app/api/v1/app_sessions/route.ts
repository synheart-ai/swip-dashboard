/**
 * SWIP App Integration API - App Sessions
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

const CreateAppSessionSchema = z.object({
  app_session_id: z.string().uuid(),
  user_id: z.string(),
  device_id: z.string(),
  started_at: z.string().datetime(),
  ended_at: z.string().datetime().optional(),
  app_id: z.string(),  // External app identifier
  data_on_cloud: z.number().int().min(0).max(1).default(0),
  avg_swip_score: z.number().optional()
});

/**
 * POST /api/v1/app_sessions
 * 
 * Create an app session record
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
    const data = CreateAppSessionSchema.parse(body);

    logInfo('SWIP App: Creating app session', { 
      appId: data.app_id, 
      sessionId: data.app_session_id 
    });

    // Find the app by appId (external identifier)
    const app = await prisma.app.findFirst({
      where: { appId: data.app_id }
    });

    if (!app) {
      return NextResponse.json(
        { 
          success: false, 
          error: `App not found with app_id: ${data.app_id}. Please create the app first via POST /api/v1/apps` 
        },
        { status: 404 }
      );
    }

    // Calculate duration
    const startedAt = new Date(data.started_at);
    const endedAt = data.ended_at ? new Date(data.ended_at) : null;
    const duration = endedAt 
      ? Math.floor((endedAt.getTime() - startedAt.getTime()) / 1000)
      : null;

    // Check if session already exists
    const existingSession = await prisma.appSession.findUnique({
      where: { appSessionId: data.app_session_id }
    });

    let session;
    if (existingSession) {
      // Update existing session
      session = await prisma.appSession.update({
        where: { appSessionId: data.app_session_id },
        data: {
          endedAt: endedAt,
          avgSwipScore: data.avg_swip_score,
          duration,
          updatedAt: new Date()
        }
      });
    } else {
      // Create new session
      session = await prisma.appSession.create({
        data: {
          appSessionId: data.app_session_id,
          appInternalId: app.id,
          userId: data.user_id,
          deviceId: data.device_id,
          startedAt,
          endedAt,
          dataOnCloud: data.data_on_cloud,
          avgSwipScore: data.avg_swip_score,
          duration
        }
      });
    }

    logInfo('SWIP App: App session created/updated', { 
      sessionId: data.app_session_id,
      id: session.id 
    });

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        app_session_id: session.appSessionId,
        started_at: session.startedAt,
        ended_at: session.endedAt,
        avg_swip_score: session.avgSwipScore
      }
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      logError(error, { context: 'v1/app_sessions:POST', details: error.errors });
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    logError(error as Error, { context: 'v1/app_sessions:POST' });
    return NextResponse.json(
      { success: false, error: 'Failed to create app session' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/v1/app_sessions
 * 
 * List app sessions for developer's claimed apps
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
    const appId = searchParams.get('app_id');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Filter to only sessions from developer's claimed apps
    const where: any = {
      app: {
        ownerId: auth.userId,
        claimable: false  // Only claimed apps
      }
    };
    if (appId) {
      // Find app first
      const app = await prisma.app.findFirst({
        where: { appId }
      });
      if (app) {
        where.appInternalId = app.id;
      }
    }

    const sessions = await prisma.appSession.findMany({
      where,
      take: Math.min(limit, 100),
      orderBy: { startedAt: 'desc' },
      include: {
        app: {
          select: {
            appId: true,
            name: true,
            category: true
          }
        },
        _count: {
          select: {
            biosignals: true
          }
        }
      }
    });

    const sessionsFormatted = sessions.map(s => ({
      app_session_id: s.appSessionId,
      app_id: s.app.appId,
      app_name: s.app.name,
      started_at: s.startedAt,
      ended_at: s.endedAt,
      duration: s.duration,
      avg_swip_score: s.avgSwipScore,
      biosignals_count: s._count.biosignals
    }));

    return NextResponse.json({
      success: true,
      sessions: sessionsFormatted,
      total: sessions.length
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
      }
    });
  } catch (error) {
    logError(error as Error, { context: 'v1/app_sessions:GET' });
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

