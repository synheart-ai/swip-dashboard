/**
 * Analytics Metrics API
 *
 * Endpoint to fetch P1 metrics based on filters
 */

import { NextRequest, NextResponse } from 'next/server';
import { calculateP1Metrics } from '@/lib/analytics';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { filters } = body;

    const metrics = await calculateP1Metrics(filters);

    return NextResponse.json(metrics, { status: 200 });
  } catch (error) {
    console.error('Error fetching analytics metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics metrics' },
      { status: 500 }
    );
  }
}

