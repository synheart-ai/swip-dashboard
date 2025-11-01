/**
 * Analytics Sessions API
 *
 * Endpoint to fetch session data based on filters
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { FilterState } from '@/components/DashboardFilters';

interface DateRange {
  start: Date;
  end: Date;
}

function getDateRange(filter: string): DateRange | null {
  const now = new Date();
  const start = new Date();

  switch (filter) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      break;
    case 'thisWeek':
      start.setDate(now.getDate() - 7);
      break;
    case 'thisMonth':
      start.setDate(now.getDate() - 30);
      break;
    case 'allTime':
      return null; // No date filter for all time
    default:
      start.setDate(now.getDate() - 7);
  }

  return { start, end: now };
}

function buildWhereClause(filters: FilterState) {
  const dateRange = getDateRange(filters.dateRange);
  const where: any = {};

  // Only add date filter if not "All Time"
  if (dateRange) {
    where.createdAt = {
      gte: dateRange.start,
      lte: dateRange.end,
    };
  }

  if (filters.wearables.length > 0) {
    where.wearable = { in: filters.wearables };
  }

  if (filters.os.length > 0) {
    where.os = { in: filters.os };
  }

  return where;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { filters } = body as { filters: FilterState };

    if (!filters) {
      return NextResponse.json(
        { error: 'Missing filters in request body' },
        { status: 400 }
      );
    }

    const where = buildWhereClause(filters);

    // Valid emotions only - filter at database level (match database case)
    const VALID_EMOTIONS = ['stressed', 'neutral', 'happy']; // Using 'happy' instead of 'amused'
    const emotionFilter = {
      OR: [
        { emotion: { in: VALID_EMOTIONS } },
        { emotion: null }
      ]
    };

    // Build final where clause - combine date/wearable/os filters with emotion filter
    const finalWhere: any = {
      AND: [emotionFilter]
    };

    // Only add other filters if where clause is not empty
    const hasOtherFilters = Object.keys(where).length > 0;
    if (hasOtherFilters) {
      finalWhere.AND.push(where);
    }

    const sessions = await prisma.swipSession.findMany({
      where: finalWhere,
      include: {
        app: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        startedAt: 'desc',
      },
      take: 100, // Limit to 100 sessions
    });

    // Transform sessions to match SessionData interface
    const sessionData = sessions.map((session) => {
      // Calculate average BPM from hrData
      let avgBpm = null;
      if (session.hrData && Array.isArray(session.hrData)) {
        const hrArray = session.hrData as number[];
        if (hrArray.length > 0) {
          avgBpm = hrArray.reduce((sum, hr) => sum + hr, 0) / hrArray.length;
        }
      }

      // Calculate average HRV from hrvMetrics
      let avgHrv = null;
      if (session.hrvMetrics && typeof session.hrvMetrics === 'object') {
        const hrv = session.hrvMetrics as any;
        avgHrv = hrv.rmssd || hrv.sdnn || null;
      }

      return {
        sessionId: session.sessionId,
        appName: session.app?.name || 'Unknown App',
        wearable: session.wearable,
        startedAt: session.startedAt,
        endedAt: session.endedAt,
        duration: session.duration,
        avgBpm,
        avgHrv,
        emotion: session.emotion,
        swipScore: session.swipScore,
        stressRate: session.stressRate,
        os: session.os,
      };
    });

    return NextResponse.json(sessionData, { status: 200 });
  } catch (error) {
    console.error('Error fetching analytics sessions:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error('Error details:', errorMessage);
    if (errorStack) {
      console.error('Stack trace:', errorStack);
    }
    
    // Check if it's a database connection error
    const isDatabaseError = errorMessage.includes('Prisma') || 
                           errorMessage.includes('database') ||
                           errorMessage.includes('connect');
    
    return NextResponse.json(
      { 
        error: isDatabaseError 
          ? 'Database connection error. Please check your database configuration.'
          : 'Failed to fetch analytics sessions',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}

