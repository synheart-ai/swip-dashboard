/**
 * SWIP App Integration API - App Sessions
 * 
 * POST: Protected with developer API key (Swip app uses its own API key)
 * GET: Protected with developer API key (read-only access)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../src/lib/db';
import { z } from 'zod';
import { logInfo, logError } from '../../../../src/lib/logger';
import { validateIngestionAuth, verifyAppIdMatch } from '../../../../src/lib/auth-ingestion';
import { validateDeveloperApiKey } from '../../../../src/lib/auth-developer-key';
import { getCachedJson, setCachedJson, isCacheAvailable } from '../../../../src/lib/cache';

const CreateAppSessionSchema = z.object({
  app_session_id: z.string().uuid(),
  user_id: z.string(),
  device_id: z.string(),
  started_at: z.string().datetime(),
  ended_at: z.string().datetime().optional(),
  app_id: z.string(),  // External app identifier
  data_on_cloud: z.number().int().min(0).max(1).default(0),
  avg_swip_score: z.number().optional(),
  dominant_emotion: z.string().optional()
});

/**
 * POST /api/v1/app_sessions
 * 
 * Create an app session record
 * PROTECTED: Requires developer API key (Swip app uses its own API key)
 * - Swip app: Can create sessions for any app
 * - Other verified apps: Can only create sessions for their own app (app ID in data must match API key's app ID)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = CreateAppSessionSchema.parse(body);

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

    // Verify app ID match (for non-Swip apps, app ID in data must match API key's app ID)
    const appIdVerification = verifyAppIdMatch(auth, data.app_id);
    if (!appIdVerification.valid) {
      return NextResponse.json(
        { 
          success: false, 
          error: appIdVerification.error 
        },
        { status: 403 }
      );
    }

    logInfo('App ingestion: Creating app session', { 
      appId: data.app_id, 
      sessionId: data.app_session_id,
      isSwipApp: auth.isSwipApp
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
          dominantEmotion: data.dominant_emotion ?? existingSession.dominantEmotion,
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
          dominantEmotion: data.dominant_emotion,
          duration
        }
      });
    }

    logInfo('App ingestion: App session created/updated', { 
      sessionId: data.app_session_id,
      id: session.id,
      isSwipApp: auth.isSwipApp
    });

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        app_session_id: session.appSessionId,
        started_at: session.startedAt,
        ended_at: session.endedAt,
        avg_swip_score: session.avgSwipScore,
        dominant_emotion: session.dominantEmotion
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
    const limitRaw = parseInt(searchParams.get('limit') || '50', 10);
    const limit = Math.min(Math.max(Number.isNaN(limitRaw) ? 50 : limitRaw, 1), 100);

    const cacheKeyBase = `developer:sessions:${auth.userId}`;
    const cacheKey = `${cacheKeyBase}:app:${appId || 'all'}:limit:${limit}`;

    if (isCacheAvailable()) {
      const cached = await getCachedJson<{ sessions: any[]; total: number }>(cacheKey);
      if (cached) {
        logInfo('Developer API: Sessions fetched from cache', { userId: auth.userId, sessionCount: cached.total });
        return NextResponse.json({
          success: true,
          sessions: cached.sessions,
          total: cached.total,
          cache: 'hit'
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
          }
        });
      }
    }

    // Filter to only sessions from developer's claimed apps
    const where: any = {
      app: {
        ownerId: auth.userId,
        claimable: false,
        ...(appId ? { appId } : {})
      }
    };

    const sessions = await prisma.appSession.findMany({
      where,
      take: limit,
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
    dominant_emotion: s.dominantEmotion,
      biosignals_count: s._count.biosignals
    }));

    const responsePayload = {
      success: true,
      sessions: sessionsFormatted,
      total: sessions.length
    };

    if (isCacheAvailable()) {
      await setCachedJson(cacheKey, { sessions: sessionsFormatted, total: sessions.length }, 60);
    }

    return NextResponse.json(responsePayload, {
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

