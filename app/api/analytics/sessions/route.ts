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

    // Build where clause for AppSession (date filter uses createdAt)
    const finalWhere: any = {};
    if (where.createdAt) {
      finalWhere.createdAt = where.createdAt;
    }

    const sessions = await prisma.appSession.findMany({
      where: finalWhere,
      include: {
        app: {
          select: {
            name: true,
          },
        },
        biosignals: {
          include: {
            emotions: {
              where: {
                dominantEmotion: {
                  in: ['Stressed', 'Neutral', 'Happy', 'stressed', 'neutral', 'happy']
                }
              },
              orderBy: {
                createdAt: 'desc',
              },
              take: 1, // Get most recent emotion per biosignal
            },
          },
          orderBy: {
            timestamp: 'desc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 100, // Limit to 100 sessions
    });

    // Transform sessions to match SessionData interface
    const sessionData = sessions.map((session) => {
      // Calculate average BPM from biosignals
      const heartRates = session.biosignals
        .map(b => b.heartRate)
        .filter((hr): hr is number => hr !== null && hr !== undefined);
      const avgBpm = heartRates.length > 0
        ? heartRates.reduce((sum, hr) => sum + hr, 0) / heartRates.length
        : null;

      // Calculate average HRV from biosignals
      const hrvValues = session.biosignals
        .map(b => b.hrvSdnn)
        .filter((hrv): hrv is number => hrv !== null && hrv !== undefined);
      const avgHrv = hrvValues.length > 0
        ? hrvValues.reduce((sum, hrv) => sum + hrv, 0) / hrvValues.length
        : null;

      // Get most recent emotion
      const recentEmotion = session.biosignals
        .flatMap(b => b.emotions)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
      
      // Calculate stress rate from emotion
      const stressRateMap: Record<string, number> = {
        'Stressed': 80,
        'stressed': 80,
        'Anxious': 70,
        'Neutral': 20,
        'neutral': 20,
        'Happy': 10,
        'happy': 10,
      };
      const stressRate = recentEmotion
        ? stressRateMap[recentEmotion.dominantEmotion] || 30
        : null;

      return {
        sessionId: session.appSessionId,
        appName: session.app?.name || 'Unknown App',
        wearable: null, // AppSession doesn't track wearable directly
        startedAt: session.startedAt,
        endedAt: session.endedAt,
        duration: session.duration,
        avgBpm,
        avgHrv,
        emotion: recentEmotion?.dominantEmotion.toLowerCase() || null,
        swipScore: session.avgSwipScore,
        stressRate,
        os: null, // AppSession doesn't track os directly
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

