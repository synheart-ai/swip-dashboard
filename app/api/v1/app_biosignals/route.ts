/**
 * SWIP App Integration API - Biosignals
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

const BiosignalSchema = z.object({
  app_biosignal_id: z.string().uuid(),
  app_session_id: z.string().uuid(),
  timestamp: z.string().datetime(),
  respiratory_rate: z.number().optional(),
  hrv_sdnn: z.number().optional(),
  heart_rate: z.number().int().optional(),
  accelerometer: z.number().optional(),
  temperature: z.number().optional(),
  blood_oxygen_saturation: z.number().optional(),
  ecg: z.number().optional(),
  emg: z.number().optional(),
  eda: z.number().optional(),
  gyro: z.array(z.number()).optional(),
  ppg: z.number().optional(),
  ibi: z.number().optional()
});

const CreateBiosignalsSchema = z.array(BiosignalSchema);

/**
 * POST /api/v1/app_biosignals
 * 
 * Bulk create biosignal records
 * PROTECTED: Requires developer API key (Swip app uses its own API key)
 * - Swip app: Can create biosignals for any app's sessions
 * - Other verified apps: Can only create biosignals for their own app's sessions (session's app ID must match API key's app ID)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const biosignals = CreateBiosignalsSchema.parse(body);

    if (biosignals.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Empty biosignals array' },
        { status: 400 }
      );
    }

    // Get app_id from session first (needed for auth validation)
    const session = await prisma.appSession.findUnique({
      where: { appSessionId: biosignals[0].app_session_id },
      include: {
        app: {
          select: {
            appId: true  // External app ID
          }
        }
      }
    });

    if (!session) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Session not found: ${biosignals[0].app_session_id}. Please create session first via POST /api/v1/app_sessions` 
        },
        { status: 404 }
      );
    }

    // Validate ingestion auth (uses developer API key, with special handling for Swip app ID)
    // Pass app_id from session to verify it matches API key's app_id when x-api-key is used
    const auth = await validateIngestionAuth(request, session.app?.appId);
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
    if (session.app?.appId && !auth.isSwipApp) {
      const appIdVerification = verifyAppIdMatch(auth, session.app.appId);
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

    logInfo('App ingestion: Creating biosignals', { 
      count: biosignals.length,
      sessionId: biosignals[0].app_session_id,
      isSwipApp: auth.isSwipApp
    });

    // Bulk create biosignals
    const created = await prisma.appBiosignal.createMany({
      data: biosignals.map(b => ({
        appBiosignalId: b.app_biosignal_id,
        appSessionId: b.app_session_id,
        timestamp: new Date(b.timestamp),
        respiratoryRate: b.respiratory_rate,
        hrvSdnn: b.hrv_sdnn,
        heartRate: b.heart_rate,
        accelerometer: b.accelerometer,
        temperature: b.temperature,
        bloodOxygenSaturation: b.blood_oxygen_saturation,
        ecg: b.ecg,
        emg: b.emg,
        eda: b.eda,
        gyro: b.gyro,
        ppg: b.ppg,
        ibi: b.ibi
      })),
      skipDuplicates: true  // Ignore if already exists
    });

    logInfo('App ingestion: Biosignals created', { 
      count: created.count,
      sessionId: biosignals[0].app_session_id,
      isSwipApp: auth.isSwipApp
    });

    return NextResponse.json({
      success: true,
      created: created.count,
      biosignals: biosignals.length
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      logError(error, { context: 'v1/app_biosignals:POST', details: error.errors });
      return NextResponse.json(
        { success: false, error: 'Invalid biosignal data', details: error.errors },
        { status: 400 }
      );
    }

    logError(error as Error, { context: 'v1/app_biosignals:POST' });
    return NextResponse.json(
      { success: false, error: 'Failed to create biosignals' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/v1/app_biosignals
 * 
 * Get biosignals for a session
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');
    const limitRaw = parseInt(searchParams.get('limit') || '100', 10);
    const limit = Math.min(Math.max(Number.isNaN(limitRaw) ? 100 : limitRaw, 1), 1000);

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'session_id query parameter required' },
        { status: 400 }
      );
    }

    const cacheKey = `session:${sessionId}:biosignals:limit:${limit}`;

    if (isCacheAvailable()) {
      const cached = await getCachedJson<{ biosignals: any[]; total: number }>(cacheKey);
      if (cached) {
        return NextResponse.json({
          success: true,
          biosignals: cached.biosignals,
          total: cached.total,
          cache: 'hit'
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60'
          }
        });
      }
    }

    const biosignals = await prisma.appBiosignal.findMany({
      where: { appSessionId: sessionId },
      take: limit,
      orderBy: { timestamp: 'asc' },
      include: {
        emotions: {
          select: {
            swipScore: true,
            dominantEmotion: true,
            confidence: true
          }
        }
      }
    });

    const biosignalsFormatted = biosignals.map(b => ({
      app_biosignal_id: b.appBiosignalId,
      timestamp: b.timestamp,
      heart_rate: b.heartRate,
      hrv_sdnn: b.hrvSdnn,
      respiratory_rate: b.respiratoryRate,
      emotions: b.emotions
    }));

    if (isCacheAvailable()) {
      await setCachedJson(cacheKey, { biosignals: biosignalsFormatted, total: biosignals.length }, 30);
    }

    return NextResponse.json({
      success: true,
      biosignals: biosignalsFormatted,
      total: biosignals.length
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
      }
    });
  } catch (error) {
    logError(error as Error, { context: 'v1/app_biosignals:GET' });
    return NextResponse.json(
      { success: false, error: 'Failed to fetch biosignals' },
      { status: 500 }
    );
  }
}

