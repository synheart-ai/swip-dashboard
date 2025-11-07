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

function buildDateWhereClause(filters: FilterState) {
  const dateRange = getDateRange(filters.dateRange);
  if (!dateRange) return {};
  return {
    startedAt: {
      gte: dateRange.start,
      lte: dateRange.end,
    },
  };
}

function isWithinPartOfDay(date: Date, partOfDay: string): boolean {
  if (partOfDay === 'all') return true;

  const hour = date.getHours();

  switch (partOfDay) {
    case 'morning':
      return hour >= 5 && hour < 12;
    case 'afternoon':
      return hour >= 12 && hour < 17;
    case 'evening':
      return hour >= 17 && hour < 21;
    case 'night':
      return hour >= 21 || hour < 5;
    default:
      return true;
  }
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

    const finalWhere = buildDateWhereClause(filters);

    const sessions = await prisma.appSession.findMany({
      where: finalWhere,
      include: {
        app: {
          select: {
            name: true,
            category: true,
          },
        },
        device: {
          select: {
            watchModel: true,
            mobileOsVersion: true,
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
      take: 200, // fetch extra to allow filtering
    });

    // Transform sessions to match SessionData interface
    let sessionData = sessions.map((session) => {
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

      // Aggregate emotions across biosignals
      const allEmotions = session.biosignals
        .flatMap(b => b.emotions)
        .map(e => e.dominantEmotion.toLowerCase());

      const emotionCounts = allEmotions.reduce<Record<string, number>>((acc, emotion) => {
        acc[emotion] = (acc[emotion] || 0) + 1;
        return acc;
      }, {});

      let dominantEmotion: string | null = null;
      let maxCount = 0;
      Object.entries(emotionCounts).forEach(([emotion, count]) => {
        if (count > maxCount) {
          dominantEmotion = emotion;
          maxCount = count;
        }
      });

      const totalEmotionCount = allEmotions.length;
      const stressedCount = allEmotions.filter(emotion => emotion.includes('stress')).length;
      const stressRate = totalEmotionCount > 0 ? (stressedCount / totalEmotionCount) * 100 : null;

      return {
        sessionId: session.appSessionId,
        appName: session.app?.name || 'Unknown App',
        wearable: session.device?.watchModel || null,
        startedAt: session.startedAt,
        endedAt: session.endedAt,
        duration: session.duration,
        avgBpm,
        avgHrv,
        emotion: dominantEmotion,
        swipScore: session.avgSwipScore,
        stressRate,
        os: session.device?.mobileOsVersion || null,
        category: session.app?.category || 'Other',
      };
    });

    // Apply wearable filters
    if (filters.wearables.length > 0) {
      const wearableFilters = filters.wearables.map((w) => w.toLowerCase());
      sessionData = sessionData.filter((session) => {
        if (!session.wearable) return false;
        const wearableValue = session.wearable.toLowerCase();
        return wearableFilters.some((filter) => wearableValue.includes(filter));
      });
    }

    // Apply OS filters
    if (filters.os.length > 0) {
      const osFilters = filters.os.map((o) => o.toLowerCase());
      sessionData = sessionData.filter((session) => {
        if (!session.os) return false;
        const osValue = session.os.toLowerCase();
        return osFilters.some((filter) => osValue.includes(filter));
      });
    }

    // Apply category filters
    if (filters.categories.length > 0) {
      sessionData = sessionData.filter((session) => {
        const category = session.category || 'Other';
        return filters.categories.some((filterCategory) => {
          if (filterCategory === 'Other') {
            return category === 'Other' || category === '';
          }
          return category.toLowerCase() === filterCategory.toLowerCase();
        });
      });
    }

    // Apply part of day filter
    if (filters.partOfDay !== 'all') {
      sessionData = sessionData.filter((session) =>
        isWithinPartOfDay(new Date(session.startedAt), filters.partOfDay)
      );
    }

    // After all filters, cap to 100 results
    sessionData = sessionData.slice(0, 100);

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

