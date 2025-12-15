/**
 * App Metadata Fetcher API
 * 
 * Fetches app metadata from Google Play Store or Apple App Store
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { fetchAppMetadata } from '../../../../src/lib/app-store';

const MetadataRequestSchema = z.object({
  os: z.enum(['android', 'ios']),
  appId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { os, appId } = MetadataRequestSchema.parse(body);

    const metadata = await fetchAppMetadata(os, appId);

    if (!metadata) {
      return NextResponse.json(
        { error: 'Could not fetch app metadata. The app may not exist or the store may be unavailable.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      metadata
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error fetching app metadata:', error);
    return NextResponse.json(
      { error: 'Failed to fetch app metadata' },
      { status: 500 }
    );
  }
}

