/**
 * Global Leaderboard Page
 *
 * Displays top-performing apps with real-time rankings
 */

import { prisma } from "../../src/lib/db";
import { AuthWrapper } from "../../components/AuthWrapper";
import { getLeaderboardData as getCachedLeaderboardData } from "../../src/lib/redis-leaderboard";
import { auth } from "../../src/lib/auth";
import { headers } from 'next/headers';

// Icon components for stats cards
function AppsIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  );
}

function SessionsIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}

function ScoreIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
}

interface LeaderboardEntry {
  rank: number;
  appName: string;
  category: string;
  developer: string;
  appSwipScore: number;
  avgStressRate: number;
  sessions: number;
  trend: 'up' | 'down' | 'neutral';
}

async function getLeaderboardData() {
  try {
    // Get apps with their session statistics
    const apps = await prisma.app.findMany({
      include: {
        owner: true,
        swipSessions: {
          select: {
            swipScore: true,
            stressRate: true,
          },
        },
      },
    });

    // Calculate statistics for each app
    const entries: LeaderboardEntry[] = apps
      .map((app) => {
        const sessions = app.swipSessions;
        const totalSessions = sessions.length;

        // Calculate average SWIP score
        const avgSwipScore =
          sessions.reduce((sum, s) => sum + (s.swipScore || 0), 0) /
          Math.max(totalSessions, 1);

        // Calculate average stress rate
        const avgStressRate =
          sessions.reduce((sum, s) => sum + (s.stressRate || 0), 0) /
          Math.max(totalSessions, 1);

        return {
          rank: 0, // Will be set after sorting
          appName: app.name,
          category: app.category || 'Other',
          developer: app.owner ? (app.owner.name || app.owner.email.split('@')[0]) : (app.developer || 'Unknown'),
          appSwipScore: avgSwipScore,
          avgStressRate: avgStressRate,
          sessions: totalSessions,
          trend: Math.random() > 0.5 ? 'up' : 'down' as 'up' | 'down',
        };
      })
      .sort((a, b) => b.appSwipScore - a.appSwipScore)
      .map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }))
      .slice(0, 50); // Top 50 apps

    return entries;
  } catch (error) {
    console.error("Failed to fetch leaderboard data:", error);
    return [];
  }
}

async function getDeveloperData() {
  try {
    // Get developers (users who own apps) with their app statistics
    const developers = await prisma.user.findMany({
      where: {
        apps: {
          some: {}
        }
      },
      include: {
        apps: {
          include: {
            leaderboardSnapshots: {
              orderBy: { createdAt: 'desc' },
              take: 1
            }
          }
        }
      }
    });

    const developerStats = developers.map(dev => {
      const totalApps = dev.apps.length;
      const totalSessions = dev.apps.reduce((sum, app) => 
        sum + (app.leaderboardSnapshots[0]?.sessions || 0), 0
      );
      const avgSwipScore = dev.apps.reduce((sum, app) => 
        sum + (app.leaderboardSnapshots[0]?.avgScore || 0), 0
      ) / totalApps || 0;

      return {
        name: dev.name || dev.email.split('@')[0],
        email: dev.email,
        avgSwipHrv: avgSwipScore,
        totalApps: totalApps as number,
        avgHrv: '68 BPM', // TODO: Calculate from actual HRV data
        sessions: totalSessions,
        trend: Math.random() > 0.5 ? 'up' : 'down' as 'up' | 'down'
      };
    });

    return developerStats.sort((a, b) => b.avgSwipHrv - a.avgSwipHrv);
  } catch (error) {
    console.error("Failed to fetch developer data:", error);
    return [];
  }
}

async function getCategoryData() {
  try {
    // Get all apps grouped by category with their statistics
    const apps = await prisma.app.findMany({
      where: {
        category: {
          not: null
        }
      },
      include: {
        swipSessions: {
          select: {
            swipScore: true,
            stressRate: true,
          },
        },
      },
    });

    // Group by category and calculate stats
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

    // Convert to array and calculate averages
    const categoryStats = Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      avgSwipScore: data.totalSessions > 0 ? data.totalSwipScore / data.totalSessions : 0,
      avgStressRate: data.totalSessions > 0 ? data.totalStressRate / data.totalSessions : 0,
      totalApps: data.totalApps,
      totalSessions: data.totalSessions,
      trend: Math.random() > 0.5 ? 'up' : 'down' as 'up' | 'down',
    }));

    return categoryStats.sort((a, b) => b.avgSwipScore - a.avgSwipScore);
  } catch (error) {
    console.error("Failed to fetch category data:", error);
    return [];
  }
}

async function getStats() {
  try {
    // Get total apps
    const totalApps = await prisma.app.count();

    // Get active sessions (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const activeSessions = await prisma.swipSession.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
    });

    // Get average SWIP score
    const avgScoreResult = await prisma.leaderboardSnapshot.aggregate({
      _avg: {
        avgScore: true,
      },
    });

    // Get total users (app owners)
    const totalUsers = await prisma.user.count();

    return {
      totalApps,
      activeSessions,
      avgScore: avgScoreResult._avg.avgScore || 0,
      totalUsers,
    };
  } catch (error) {
    console.error("Failed to fetch stats:", error);
    return {
      totalApps: 0,
      activeSessions: 0,
      avgScore: 0,
      totalUsers: 0,
    };
  }
}

export default async function LeaderboardPage() {
  return (
    <AuthWrapper>
      <LeaderboardPageContent />
    </AuthWrapper>
  );
}

import { ModernLeaderboard } from '@/components/ModernLeaderboard';

async function LeaderboardPageContent() {
  // Get current user (if logged in)
  let currentUserId: string | undefined;
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    currentUserId = session?.user?.id;
  } catch {
    // User not logged in, that's fine
    currentUserId = undefined;
  }

  // Get cached leaderboard data
  const leaderboardData = await getCachedLeaderboardData();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 p-6">
      <div className="max-w-[1800px] mx-auto">
        <ModernLeaderboard 
          entries={leaderboardData.entries} 
          developerData={leaderboardData.developerData}
          categoryData={leaderboardData.categoryData}
          stats={leaderboardData.stats}
          expiresAt={leaderboardData.expiresAt}
          currentUserId={currentUserId}
        />
      </div>
    </div>
  );
}
