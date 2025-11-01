/**
 * Leaderboard Recalculation API
 * 
 * Endpoint to manually trigger leaderboard recalculation
 */

import { NextResponse } from 'next/server';
import { forceRecalculateLeaderboard } from '@/lib/redis-leaderboard';

export async function POST(request: Request) {
  try {
    // Optional: Add authentication check here
    // const user = await requireUser(request);
    // if (!user.isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const data = await forceRecalculateLeaderboard();
    
    return NextResponse.json({
      success: true,
      message: 'Leaderboard recalculated successfully',
      calculatedAt: data.calculatedAt,
      expiresAt: data.expiresAt,
    });
  } catch (error) {
    console.error('Failed to recalculate leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to recalculate leaderboard' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST to trigger recalculation',
  });
}

