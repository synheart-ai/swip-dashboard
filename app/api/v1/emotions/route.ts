/**
 * SWIP App Integration API - Emotions
 * 
 * POST: Protected with developer API key (Swip app uses its own API key)
 * GET: Protected with developer API key (read-only access)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../src/lib/db';
import { z } from 'zod';
import { logInfo, logError } from '../../../../src/lib/logger';
import { validateIngestionAuth, verifyAppIdMatch } from '../../../../src/lib/auth-ingestion';
import { getCachedJson, setCachedJson, isCacheAvailable } from '../../../../src/lib/cache';

const EmotionSchema = z.object({
  id: z.number().int().optional(),  // Original emotion ID
  app_biosignal_id: z.string().uuid(),
  swip_score: z.number(),
  phys_subscore: z.number().default(0),
  emo_subscore: z.number().default(0),
  confidence: z.number().min(0).max(1),
  dominant_emotion: z.string(),  // calm, stressed, anxious, happy, neutral, sad, focused, excited, Amused
  model_id: z.string()
});

const CreateEmotionsSchema = z.array(EmotionSchema);

/**
 * POST /api/v1/emotions
 * 
 * Bulk create emotion records
 * PROTECTED: Requires developer API key (Swip app uses its own API key)
 * - Swip app: Can create emotions for any app's biosignals
 * - Other verified apps: Can only create emotions for their own app's biosignals (biosignal's session app ID must match API key's app ID)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const emotions = CreateEmotionsSchema.parse(body);

    if (emotions.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Empty emotions array' },
        { status: 400 }
      );
    }

    // Verify biosignal exists and get app ID from session
    const biosignal = await prisma.appBiosignal.findUnique({
      where: { appBiosignalId: emotions[0].app_biosignal_id },
      include: {
        session: {
          include: {
            app: {
              select: {
                appId: true  // External app ID
              }
            }
          }
        }
      }
    });

    if (!biosignal) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Biosignal not found: ${emotions[0].app_biosignal_id}. Please create biosignals first via POST /api/v1/app_biosignals` 
        },
        { status: 404 }
      );
    }

    // Validate ingestion auth (uses developer API key, with special handling for Swip app ID)
    // Pass app_id from session to verify it matches API key's app_id when x-api-key is used
    const auth = await validateIngestionAuth(request, biosignal.session?.app?.appId);
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

    // Verify app ID match (for non-Swip apps, session's app ID must match API key's app ID)
    // This is already checked in validateIngestionAuth, but we verify again for clarity
    if (biosignal.session?.app?.appId && !auth.isSwipApp) {
      const appIdVerification = verifyAppIdMatch(auth, biosignal.session.app.appId);
      if (!appIdVerification.valid) {
        return NextResponse.json(
          { 
            success: false, 
            error: appIdVerification.error 
          },
          { status: 403 }
        );
      }
    }

    logInfo('App ingestion: Creating emotions', { 
      count: emotions.length,
      biosignalId: emotions[0].app_biosignal_id,
      isSwipApp: auth.isSwipApp
    });

    // Bulk create emotions
    const created = await prisma.emotion.createMany({
      data: emotions.map(e => ({
        emotionId: e.id,
        appBiosignalId: e.app_biosignal_id,
        swipScore: e.swip_score,
        physSubscore: e.phys_subscore,
        emoSubscore: e.emo_subscore,
        confidence: e.confidence,
        dominantEmotion: e.dominant_emotion,
        modelId: e.model_id
      })),
      skipDuplicates: true
    });

    // Update session average SWIP score
    const session = await prisma.appSession.findUnique({
      where: { appSessionId: biosignal.appSessionId },
      include: {
        biosignals: {
          include: {
            emotions: true
          }
        }
      }
    });

    if (session) {
      // Calculate average SWIP score and dominant emotion from all emotions in the session
      const allEmotions = session.biosignals.flatMap(b => b.emotions);

      let avgScore: number | null = null;
      let dominantEmotion: string | null = null;

      if (allEmotions.length > 0) {
        avgScore = allEmotions.reduce((sum, e) => sum + e.swipScore, 0) / allEmotions.length;

        const emotionCounts = allEmotions.reduce<Record<string, number>>((acc, emotion) => {
          const key = emotion.dominantEmotion?.toLowerCase() ?? 'unknown';
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {});

        const sorted = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1]);
        dominantEmotion = sorted.length > 0 ? sorted[0][0] : null;
      }

      await prisma.appSession.update({
        where: { id: session.id },
        data: {
          avgSwipScore: avgScore ?? null,
          dominantEmotion
        }
      });

      if (avgScore !== null) {
        // Update app average score
        await updateAppAvgScore(session.appInternalId);
      }
    }

    logInfo('App ingestion: Emotions created', { 
      count: created.count,
      biosignalId: emotions[0].app_biosignal_id,
      isSwipApp: auth.isSwipApp
    });

    return NextResponse.json({
      success: true,
      created: created.count,
      emotions: emotions.length
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      logError(error, { context: 'v1/emotions:POST', details: error.errors });
      return NextResponse.json(
        { success: false, error: 'Invalid emotion data', details: error.errors },
        { status: 400 }
      );
    }

    logError(error as Error, { context: 'v1/emotions:POST' });
    return NextResponse.json(
      { success: false, error: 'Failed to create emotions' },
      { status: 500 }
    );
  }
}

/**
 * Helper: Update app average SWIP score
 */
async function updateAppAvgScore(appId: string) {
  try {
    const sessions = await prisma.appSession.findMany({
      where: { 
        appInternalId: appId,
        avgSwipScore: { not: null }
      },
      select: {
        avgSwipScore: true
      }
    });

    if (sessions.length > 0) {
      const avgScore = sessions.reduce((sum, s) => sum + (s.avgSwipScore || 0), 0) / sessions.length;
      
      await prisma.app.update({
        where: { id: appId },
        data: { avgSwipScore: avgScore }
      });
    }
  } catch (error) {
    logError(error as Error, { context: 'updateAppAvgScore', appId });
  }
}

/**
 * GET /api/v1/emotions
 * 
 * Get emotions for a biosignal or session
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const biosignalId = searchParams.get('biosignal_id');
    const sessionId = searchParams.get('session_id');

    const cacheKey = biosignalId
      ? `biosignal:${biosignalId}:emotions`
      : sessionId
        ? `session:${sessionId}:emotions`
        : null;

    if (cacheKey && isCacheAvailable()) {
      const cached = await getCachedJson<{ emotions: any[]; total: number }>(cacheKey);
      if (cached) {
        return NextResponse.json({
          success: true,
          emotions: cached.emotions,
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

    let where: any = {};
    
    if (biosignalId) {
      where.appBiosignalId = biosignalId;
    } else if (sessionId) {
      where.biosignal = {
        appSessionId: sessionId
      };
    } else {
      return NextResponse.json(
        { success: false, error: 'biosignal_id or session_id query parameter required' },
        { status: 400 }
      );
    }

    const emotions = await prisma.emotion.findMany({
      where,
      include: {
        biosignal: {
          select: {
            timestamp: true,
            heartRate: true,
            hrvSdnn: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    const emotionsFormatted = emotions.map(e => ({
      id: e.emotionId,
      app_biosignal_id: e.appBiosignalId,
      swip_score: e.swipScore,
      phys_subscore: e.physSubscore,
      emo_subscore: e.emoSubscore,
      confidence: e.confidence,
      dominant_emotion: e.dominantEmotion,
      model_id: e.modelId,
      timestamp: e.biosignal.timestamp,
      heart_rate: e.biosignal.heartRate,
      hrv_sdnn: e.biosignal.hrvSdnn
    }));

    if (cacheKey && isCacheAvailable()) {
      await setCachedJson(cacheKey, { emotions: emotionsFormatted, total: emotions.length }, 60);
    }

    return NextResponse.json({
      success: true,
      emotions: emotionsFormatted,
      total: emotions.length
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
      }
    });
  } catch (error) {
    logError(error as Error, { context: 'v1/emotions:GET' });
    return NextResponse.json(
      { success: false, error: 'Failed to fetch emotions' },
      { status: 500 }
    );
  }
}

