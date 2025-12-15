/**
 * Devices API - SWIP App Integration
 *
 * POST /api/v1/devices - Create or update device information
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../src/lib/db';
import { z } from 'zod';
import { validateDeveloperApiKey } from '../../../../src/lib/auth-developer-key';
import { isVerifiedApp } from '../../../../src/lib/verified-apps';
import { logInfo, logError } from '../../../../src/lib/logger';

const SWIP_APP_ID = 'ai.synheart.swip';

// Validation schema
const DeviceSchema = z.object({
  device_id: z.string(),
  platform: z.string().optional(),
  watch_model: z.string().optional(),
  mobileOS_version: z.string().optional(),
});

/**
 * POST - Create or update device information
 */
export async function POST(request: NextRequest) {
  try {
    const apiKeyAuth = await validateDeveloperApiKey(request);
    if (!apiKeyAuth.valid) {
      logError(new Error('Unauthorized attempt to POST /api/v1/devices'), { ip: request.headers.get('x-forwarded-for') || 'unknown' });
      return NextResponse.json(
        { 
          success: false, 
          error: apiKeyAuth.error || 'Unauthorized: Invalid or missing authentication',
          message: 'This endpoint requires x-api-key header'
        },
        { status: 401 }
      );
    }

    const appExternalId = apiKeyAuth.apiKey?.appExternalId;
    if (!appExternalId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'API key is not associated with an app'
        },
        { status: 403 }
      );
    }

    if (appExternalId !== SWIP_APP_ID && !(await isVerifiedApp(appExternalId))) {
      return NextResponse.json(
        { 
          success: false, 
          error: `App ${appExternalId} is not verified for data ingestion`
        },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const validatedData = DeviceSchema.parse(body);

    // Upsert device (create or update)
    const device = await prisma.device.upsert({
      where: {
        deviceId: validatedData.device_id,
      },
      update: {
        platform: validatedData.platform,
        watchModel: validatedData.watch_model,
        mobileOsVersion: validatedData.mobileOS_version,
        updatedAt: new Date(),
      },
      create: {
        deviceId: validatedData.device_id,
        platform: validatedData.platform,
        watchModel: validatedData.watch_model,
        mobileOsVersion: validatedData.mobileOS_version,
      },
    });

    logInfo('Device upserted', {
      deviceId: device.deviceId,
      platform: device.platform,
    });

    return NextResponse.json(
      {
        success: true,
        device: {
          id: device.id,
          device_id: device.deviceId,
          platform: device.platform,
          watch_model: device.watchModel,
          mobileOS_version: device.mobileOsVersion,
        },
      },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      logError(error, { context: 'devices:POST:validation' });
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    logError(error as Error, { context: 'devices:POST' });
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process device data',
      },
      { status: 500 }
    );
  }
}

