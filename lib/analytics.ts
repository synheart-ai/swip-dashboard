/**
 * Analytics Functions
 * 
 * Functions to calculate all P1 metrics for the dashboard
 */

import { prisma } from "../src/lib/db";
import { FilterState } from "../components/DashboardFilters";

interface DateRange {
  start: Date;
  end: Date;
}

// Helper function to get date range based on filter
function getDateRange(filter: string): DateRange {
  const now = new Date();
  const start = new Date();

  switch (filter) {
    case 'last6h':
      start.setHours(now.getHours() - 6);
      break;
    case 'today':
      start.setHours(0, 0, 0, 0);
      break;
    case 'thisWeek':
      start.setDate(now.getDate() - 7);
      break;
    case 'thisMonth':
      start.setDate(now.getDate() - 30);
      break;
    default:
      start.setDate(now.getDate() - 7);
  }

  return { start, end: now };
}

// Helper function to apply filters to query
function buildWhereClause(filters: FilterState) {
  const { start, end } = getDateRange(filters.dateRange);
  const where: any = {
    createdAt: {
      gte: start,
      lte: end,
    },
  };

  if (filters.wearables.length > 0) {
    where.wearable = { in: filters.wearables };
  }

  if (filters.os.length > 0) {
    where.os = { in: filters.os };
  }

  // Part of day filter
  if (filters.partOfDay !== 'all') {
    const hour = new Date().getHours();
    let hourStart, hourEnd;
    
    switch (filters.partOfDay) {
      case 'morning':
        hourStart = 6; hourEnd = 12;
        break;
      case 'afternoon':
        hourStart = 12; hourEnd = 18;
        break;
      case 'evening':
        hourStart = 18; hourEnd = 22;
        break;
      case 'night':
        hourStart = 22; hourEnd = 6;
        break;
    }
  }

  return where;
}

export interface P1Metrics {
  // Users
  totalUsers: number;
  newUsers: number;
  usersTrend: Array<{ date: string; value: number }>;
  newUsersTrend: Array<{ date: string; value: number }>;

  // SWIP Score
  avgSwipScore: number;
  swipScoreTrend: Array<{ date: string; value: number }>;

  // Sessions
  totalSessions: number;
  sessionsTrend: Array<{ date: string; value: number }>;
  avgSessionsPerDay: number;
  avgSessionsPerUser: number;
  avgSessionsPerUserPerDay: number;

  // Stress Rate
  avgStressRate: number;
  stressRateTrend: Array<{ date: string; value: number }>;

  // Duration
  avgSessionDuration: number;
  durationTrend: Array<{ date: string; value: number }>;

  // HRV
  avgHrv: number;

  // Heatmap
  swipScoreHeatmap: Array<{ day: string; hour: number; score: number }>;
}

export async function calculateP1Metrics(filters: FilterState): Promise<P1Metrics> {
  try {
    const where = buildWhereClause(filters);
    const { start, end } = getDateRange(filters.dateRange);

    // Calculate total users
    const totalUsers = await prisma.user.count();

    // Calculate new users (within filter range)
    const newUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
    });

    // Calculate total sessions
    const totalSessions = await prisma.appSession.count({ where });

    // Calculate average SWIP score
    const avgSwipScoreResult = await prisma.appSession.aggregate({
      where: {
        ...where,
        avgSwipScore: { not: null },
      },
      _avg: {
        avgSwipScore: true,
      },
    });
    const avgSwipScore = avgSwipScoreResult._avg.avgSwipScore || 0;

    // Note: Stress rate and HRV are calculated from biosignals/emotions, not directly from AppSession
    // For now, we'll set these to 0 and calculate from biosignals if needed
    const avgStressRate = 0; // TODO: Calculate from emotions via biosignals

    // Calculate average session duration
    const avgDurationResult = await prisma.appSession.aggregate({
      where: {
        ...where,
        duration: { not: null },
      },
      _avg: {
        duration: true,
      },
    });
    const avgSessionDuration = avgDurationResult._avg.duration || 0;

    // Calculate average HRV from biosignals
    const sessions = await prisma.appSession.findMany({
      where: {
        ...where,
      },
      include: {
        biosignals: {
          select: {
            hrvSdnn: true,
          },
        },
      },
    });

    let totalHrv = 0;
    let hrvCount = 0;
    sessions.forEach((session) => {
      session.biosignals.forEach(biosignal => {
        if (biosignal.hrvSdnn !== null && biosignal.hrvSdnn !== undefined) {
          totalHrv += biosignal.hrvSdnn;
          hrvCount++;
        }
      });
    });
    const avgHrv = hrvCount > 0 ? totalHrv / hrvCount : 0;

    // Calculate sessions per day
    const daysDiff = Math.max(1, (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const avgSessionsPerDay = totalSessions / daysDiff;

    // Calculate sessions per user
    const avgSessionsPerUser = totalUsers > 0 ? totalSessions / totalUsers : 0;

    // Calculate sessions per user per day
    const avgSessionsPerUserPerDay = totalUsers > 0 ? avgSessionsPerDay / totalUsers : 0;

    // Generate trend data (simplified - last 7 days)
    const trendData = await generateTrendData(where, start, end);

    // Generate heatmap data
    const heatmapData = await generateHeatmapData(where);

    return {
      totalUsers,
      newUsers,
      usersTrend: trendData.usersTrend,
      newUsersTrend: trendData.newUsersTrend,
      avgSwipScore,
      swipScoreTrend: trendData.swipScoreTrend,
      totalSessions,
      sessionsTrend: trendData.sessionsTrend,
      avgSessionsPerDay,
      avgSessionsPerUser,
      avgSessionsPerUserPerDay,
      avgStressRate,
      stressRateTrend: trendData.stressRateTrend,
      avgSessionDuration,
      durationTrend: trendData.durationTrend,
      avgHrv,
      swipScoreHeatmap: heatmapData,
    };
  } catch (error) {
    console.error('Error calculating P1 metrics:', error);
    // Return default values
    return {
      totalUsers: 0,
      newUsers: 0,
      usersTrend: [],
      newUsersTrend: [],
      avgSwipScore: 0,
      swipScoreTrend: [],
      totalSessions: 0,
      sessionsTrend: [],
      avgSessionsPerDay: 0,
      avgSessionsPerUser: 0,
      avgSessionsPerUserPerDay: 0,
      avgStressRate: 0,
      stressRateTrend: [],
      avgSessionDuration: 0,
      durationTrend: [],
      avgHrv: 0,
      swipScoreHeatmap: [],
    };
  }
}

async function generateTrendData(where: any, start: Date, end: Date) {
  const days = 7;
  const usersTrend = [];
  const newUsersTrend = [];
  const swipScoreTrend = [];
  const sessionsTrend = [];
  const stressRateTrend = [];
  const durationTrend = [];

  for (let i = days - 1; i >= 0; i--) {
    const dayStart = new Date(end);
    dayStart.setDate(dayStart.getDate() - i);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    const dateStr = dayStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    // Users count for the day
    const usersCount = await prisma.user.count({
      where: {
        createdAt: {
          lte: dayEnd,
        },
      },
    });
    usersTrend.push({ date: dateStr, value: usersCount });

    // New users for the day
    const newUsersCount = await prisma.user.count({
      where: {
        createdAt: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
    });
    newUsersTrend.push({ date: dateStr, value: newUsersCount });

    // Sessions for the day
    const sessionsCount = await prisma.appSession.count({
      where: {
        ...where,
        createdAt: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
    });
    sessionsTrend.push({ date: dateStr, value: sessionsCount });

    // Average SWIP score for the day
    const avgSwipScore = await prisma.appSession.aggregate({
      where: {
        ...where,
        avgSwipScore: { not: null },
        createdAt: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
      _avg: {
        avgSwipScore: true,
      },
    });
    swipScoreTrend.push({ date: dateStr, value: avgSwipScore._avg.avgSwipScore || 0 });

    // Average stress rate for the day
    const avgStressRate = await prisma.swipSession.aggregate({
      where: {
        ...where,
        stressRate: { not: null },
        createdAt: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
      _avg: {
        stressRate: true,
      },
    });
    stressRateTrend.push({ date: dateStr, value: avgStressRate._avg.stressRate || 0 });

    // Average duration for the day
    const avgDuration = await prisma.swipSession.aggregate({
      where: {
        ...where,
        duration: { not: null },
        createdAt: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
      _avg: {
        duration: true,
      },
    });
    durationTrend.push({ date: dateStr, value: avgDuration._avg.duration || 0 });
  }

  return {
    usersTrend,
    newUsersTrend,
    swipScoreTrend,
    sessionsTrend,
    stressRateTrend,
    durationTrend,
  };
}

async function generateHeatmapData(where: any) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const heatmapData: Array<{ day: string; hour: number; score: number }> = [];

  // Get sessions grouped by day and hour
  const sessions = await prisma.appSession.findMany({
    where: {
      ...where,
      avgSwipScore: { not: null },
    },
    select: {
      avgSwipScore: true,
      startedAt: true,
    },
  });

  // Initialize data structure
  const dataMap = new Map<string, { sum: number; count: number }>();

  sessions.forEach((session) => {
    const date = new Date(session.startedAt);
    const dayIndex = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const day = days[(dayIndex + 6) % 7]; // Adjust to start with Monday
    const hour = date.getHours();
    const key = `${day}-${hour}`;

    const current = dataMap.get(key) || { sum: 0, count: 0 };
    current.sum += session.avgSwipScore || 0;
    current.count += 1;
    dataMap.set(key, current);
  });

  // Generate heatmap data
  days.forEach((day) => {
    for (let hour = 0; hour < 24; hour++) {
      const key = `${day}-${hour}`;
      const data = dataMap.get(key);
      const score = data ? data.sum / data.count : 0;
      heatmapData.push({ day, hour, score });
    }
  });

  return heatmapData;
}

