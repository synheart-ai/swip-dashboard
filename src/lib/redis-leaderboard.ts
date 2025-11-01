/**
 * Redis Leaderboard Cache System
 * 
 * Caches leaderboard data for 24 hours and manages recalculation
 */

import { prisma } from './db';

// Optional Redis - only use if configured
let redis: any = null;
try {
  const redisModule = require('./redis');
  redis = redisModule.redis;
} catch (error) {
  console.log('⚠️  Redis not configured, using direct database queries');
}

const LEADERBOARD_CACHE_KEY = 'leaderboard:data';
const LEADERBOARD_EXPIRY_KEY = 'leaderboard:expiry';
const CACHE_DURATION = 24 * 60 * 60; // 24 hours in seconds

interface LeaderboardData {
  entries: any[];
  developerData: any[];
  categoryData: any[];
  stats: {
    totalApps: number;
    averageSwipScore: number;
    avgScore: number; // Alias for averageSwipScore
    totalUsers: number;
    newUsers: number;
    stressRate: number;
    activeSessions: number;
  };
  calculatedAt: string;
  expiresAt: string;
}

/**
 * Get cached leaderboard data or calculate if expired
 */
export async function getLeaderboardData(): Promise<LeaderboardData> {
  // If Redis is not available, always calculate fresh
  if (!redis) {
    console.log('📊 Calculating leaderboard (Redis not available)');
    return await calculateLeaderboardDirect();
  }

  try {
    // Try to get from cache
    const cached = await redis.get(LEADERBOARD_CACHE_KEY);
    
    if (cached) {
      console.log('✅ Leaderboard from cache');
      return JSON.parse(cached);
    }
    
    // If not cached, calculate fresh data
    console.log('📊 Cache miss, calculating leaderboard');
    return await calculateAndCacheLeaderboard();
  } catch (error) {
    console.error('⚠️  Redis error, using direct database:', error);
    return await calculateLeaderboardDirect();
  }
}

/**
 * Get time remaining until cache expires (in seconds)
 */
export async function getTimeUntilExpiry(): Promise<number> {
  if (!redis) return CACHE_DURATION; // Return full 24h if no Redis
  
  try {
    const ttl = await redis.ttl(LEADERBOARD_CACHE_KEY);
    return Math.max(0, ttl);
  } catch (error) {
    console.error('Failed to get TTL:', error);
    return CACHE_DURATION;
  }
}

/**
 * Calculate leaderboard and cache for 24 hours
 */
export async function calculateAndCacheLeaderboard(): Promise<LeaderboardData> {
  const data = await calculateLeaderboardDirect();
  
  if (redis) {
    try {
      // Cache the data
      await redis.setex(
        LEADERBOARD_CACHE_KEY,
        CACHE_DURATION,
        JSON.stringify(data)
      );
      
      console.log('✅ Leaderboard cached for 24 hours in Redis');
    } catch (error) {
      console.error('⚠️  Failed to cache leaderboard, continuing without cache:', error);
    }
  } else {
    console.log('ℹ️  Redis not available, data calculated but not cached');
  }
  
  return data;
}

/**
 * Calculate leaderboard data from database
 */
async function calculateLeaderboardDirect(): Promise<LeaderboardData> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + CACHE_DURATION * 1000);

  // Valid emotions to track (match database case - lowercase)
  const VALID_EMOTIONS = ['stressed', 'neutral', 'happy']; // Using 'happy' instead of 'amused'
  
  // Get all apps with session data (filter to only valid emotions)
  const apps = await prisma.app.findMany({
    include: {
      owner: true,
      swipSessions: {
        where: {
          OR: [
            { emotion: { in: VALID_EMOTIONS } },
            { emotion: null }
          ]
        },
        select: {
          swipScore: true,
          stressRate: true,
          emotion: true,
          duration: true,
        },
      },
    },
  });

  // Calculate app leaderboard entries
  const entries = apps
    .map((app) => {
      const sessions = app.swipSessions;
      const totalSessions = sessions.length;

      if (totalSessions === 0) return null;

      // Calculate averages for THIS app only (WHERE app_id = current_app.id)
      const avgSwipScore = sessions.reduce((sum, s) => sum + (s.swipScore || 0), 0) / totalSessions;
      const avgStressRate = sessions.reduce((sum, s) => sum + (s.stressRate || 0), 0) / totalSessions;
      // Average duration: SUM(duration) / COUNT(session_id) for this specific app
      const avgDuration = sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / totalSessions;

      return {
        rank: 0,
        appId: app.id,
        appName: app.name,
        category: app.category || 'Other',
        developer: app.owner.name || app.owner.email.split('@')[0],
        developerId: app.ownerId,
        appSwipScore: avgSwipScore,
        avgStressRate: avgStressRate,
        avgDuration: avgDuration, // Average duration in seconds for this app
        sessions: totalSessions,
        trend: Math.random() > 0.5 ? 'up' : 'down' as 'up' | 'down',
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
    .sort((a, b) => b.appSwipScore - a.appSwipScore)
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

  // Calculate developer data (only valid emotions)
  const developers = await prisma.user.findMany({
    where: {
      apps: {
        some: {}
      }
    },
    include: {
      apps: {
        include: {
          swipSessions: {
            where: {
              emotion: {
                in: VALID_EMOTIONS
              }
            },
            select: {
              swipScore: true,
            },
          },
        },
      },
    },
  });

  const developerData = developers.map(dev => {
    const totalApps = dev.apps.length;
    const allSessions = dev.apps.flatMap(app => app.swipSessions);
    const totalSessions = allSessions.length;
    const avgSwipScore = totalSessions > 0 
      ? allSessions.reduce((sum, s) => sum + (s.swipScore || 0), 0) / totalSessions
      : 0;

    return {
      name: dev.name || dev.email.split('@')[0],
      email: dev.email,
      avgSwipHrv: avgSwipScore,
      totalApps: totalApps,
      avgHrv: '68 BPM',
      sessions: totalSessions,
      trend: Math.random() > 0.5 ? 'up' : 'down' as 'up' | 'down'
    };
  }).sort((a, b) => b.avgSwipHrv - a.avgSwipHrv);

  // Calculate category data
  const categoryMap = new Map<string, {
    totalApps: number;
    totalSessions: number;
    totalSwipScore: number;
    totalStressRate: number;
  }>();

  apps.forEach(app => {
    const category = app.category || 'Other';
    const sessions = app.swipSessions;
    const sessionCount = sessions.length;
    const totalSwip = sessions.reduce((sum, s) => sum + (s.swipScore || 0), 0);
    const totalStress = sessions.reduce((sum, s) => sum + (s.stressRate || 0), 0);

    if (!categoryMap.has(category)) {
      categoryMap.set(category, {
        totalApps: 0,
        totalSessions: 0,
        totalSwipScore: 0,
        totalStressRate: 0,
      });
    }

    const catData = categoryMap.get(category)!;
    catData.totalApps += 1;
    catData.totalSessions += sessionCount;
    catData.totalSwipScore += totalSwip;
    catData.totalStressRate += totalStress;
  });

  const categoryData = Array.from(categoryMap.entries()).map(([category, data]) => ({
    category,
    avgSwipScore: data.totalSessions > 0 ? data.totalSwipScore / data.totalSessions : 0,
    avgStressRate: data.totalSessions > 0 ? data.totalStressRate / data.totalSessions : 0,
    totalApps: data.totalApps,
    totalSessions: data.totalSessions,
    trend: Math.random() > 0.5 ? 'up' : 'down' as 'up' | 'down',
  })).sort((a, b) => b.avgSwipScore - a.avgSwipScore);

  // Calculate stats
  const totalApps = entries.length; // Only count apps with sessions
  const totalSwipScore = entries.reduce((sum, e) => sum + e.appSwipScore, 0);
  const averageSwipScore = totalApps > 0 ? totalSwipScore / totalApps : 0;

  // Total unique users (app owners)
  const totalUsers = await prisma.user.count();

  // New users (created today)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const newUsers = await prisma.user.count({
    where: {
      createdAt: {
        gte: today,
      },
    },
  });

  // Stress rate calculation - only count valid emotions
  const allSessions = await prisma.swipSession.findMany({
    where: {
      OR: [
        { emotion: { in: VALID_EMOTIONS } },
        { emotion: null }
      ]
    },
    select: {
      emotion: true,
    },
  });
  const stressedSessions = allSessions.filter(s => s.emotion === 'stressed').length;
  const stressRate = allSessions.length > 0 ? (stressedSessions / allSessions.length) * 100 : 0;

  // Active sessions (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const activeSessions = await prisma.swipSession.count({
    where: {
      createdAt: {
        gte: sevenDaysAgo,
      },
    },
  });

  return {
    entries,
    developerData,
    categoryData,
    stats: {
      totalApps,
      averageSwipScore,
      avgScore: averageSwipScore, // Alias for consistency
      totalUsers,
      newUsers,
      stressRate,
      activeSessions,
    },
    calculatedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };
}

/**
 * Force recalculate leaderboard (called by cron job)
 */
export async function forceRecalculateLeaderboard(): Promise<LeaderboardData> {
  console.log('🔄 Force recalculating leaderboard...');
  return await calculateAndCacheLeaderboard();
}

