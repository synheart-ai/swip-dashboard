/**
 * SWIP App Integration API - Biosignals
 * 
 * POST: Protected with SWIP internal key (data ingestion)
 * GET: Protected with developer API key (read-only access)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../src/lib/db';
import { z } from 'zod';
import { logInfo, logError } from '../../../../src/lib/logger';
import { validateSwipInternalKey } from '../../../../src/lib/auth-swip';

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
    const biosignals = CreateBiosignalsSchema.parse(body);

    if (biosignals.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Empty biosignals array' },
        { status: 400 }
      );
    }

    logInfo('SWIP App: Creating biosignals', { 
      count: biosignals.length,
      sessionId: biosignals[0].app_session_id 
    });

    // Verify session exists
    const session = await prisma.appSession.findUnique({
      where: { appSessionId: biosignals[0].app_session_id }
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

    logInfo('SWIP App: Biosignals created', { 
      count: created.count,
      sessionId: biosignals[0].app_session_id 
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
    const limit = parseInt(searchParams.get('limit') || '100');

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'session_id query parameter required' },
        { status: 400 }
      );
    }

    const biosignals = await prisma.appBiosignal.findMany({
      where: { appSessionId: sessionId },
      take: Math.min(limit, 1000),
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

    return NextResponse.json({
      success: true,
      biosignals: biosignals.map(b => ({
        app_biosignal_id: b.appBiosignalId,
        timestamp: b.timestamp,
        heart_rate: b.heartRate,
        hrv_sdnn: b.hrvSdnn,
        respiratory_rate: b.respiratoryRate,
        emotions: b.emotions
      })),
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

