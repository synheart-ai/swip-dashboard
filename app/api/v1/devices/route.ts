/**
 * Devices API - SWIP App Integration
 *
 * POST /api/v1/devices - Create or update device information
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { validateSwipInternalKey } from 'src/lib/auth-swip';
import { logInfo, logError } from 'src/lib/logger';

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
    // Validate SWIP internal key
    const authResult = await validateSwipInternalKey(request);
    if (!authResult.valid) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
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

