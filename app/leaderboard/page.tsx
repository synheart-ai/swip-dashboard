/**
 * Global Leaderboard Page
 *
 * Displays top-performing apps with real-time rankings
 */

import { prisma } from "../../src/lib/db";
import { StatsCard } from "../../components/ui/StatsCard";
import { Tabs } from "../../components/ui/Tabs";
import { LeaderboardTable } from "../../components/LeaderboardTable";
import { AuthWrapper } from "../../components/AuthWrapper";

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
  appSwipScore: number;
  hrvStatus: string;
  avgHeartRate: number;
  problems: string[];
  sessions: number;
  trend: 'up' | 'down' | 'neutral';
}

async function getLeaderboardData() {
  try {
    const snapshots = await prisma.leaderboardSnapshot.findMany({
      take: 50,
      orderBy: { avgScore: "desc" },
      include: { app: true },
    });

    const entries: LeaderboardEntry[] = snapshots.map((s, index) => ({
      rank: index + 1,
      appName: s.app.name,
      appSwipScore: s.avgScore,
      hrvStatus: s.avgScore >= 70 ? "Optimal" : s.avgScore >= 60 ? "Good" : "Moderate",
      avgHeartRate: 68, // TODO: Calculate from actual data
      problems: s.avgScore < 60 ? ["Stress", "Apple Health"] : [],
      sessions: s.sessions,
      trend: Math.random() > 0.5 ? 'up' : 'down' as 'up' | 'down', // TODO: Calculate real trend
    }));

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
    // TODO: Implement category data fetching from database
    // This would require adding a category field to the App model
    return [];
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

async function LeaderboardPageContent() {
  const entries = await getLeaderboardData();
  const developerData = await getDeveloperData();
  const categoryData = await getCategoryData();
  const stats = await getStats();

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Global Leaderboard</h1>
          <p className="text-gray-400">
            Real-time rankings based on average SWIP scores and session engagement over the last 30 days
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Apps"
            value={stats.totalApps.toLocaleString()}
            icon={<AppsIcon />}
            color="pink"
            trend={{
              value: 9,
              label: "This Week",
              positive: true,
            }}
          />
          <StatsCard
            title="Active Sessions"
            value={stats.activeSessions >= 1000000 ? `${(stats.activeSessions / 1000000).toFixed(1)}M` : 
                   stats.activeSessions >= 1000 ? `${(stats.activeSessions / 1000).toFixed(1)}K` : 
                   stats.activeSessions.toString()}
            icon={<SessionsIcon />}
            color="blue"
            trend={{
              value: 83,
              label: "Vs Last month",
              positive: true,
            }}
          />
          <StatsCard
            title="Avg Swip Score"
            value={stats.avgScore.toFixed(1)}
            icon={<ScoreIcon />}
            color="purple"
            trend={{
              value: -6,
              label: "Improvement",
              positive: false,
            }}
          />
          <StatsCard
            title="Total Users"
            value={stats.totalUsers >= 1000000 ? `${(stats.totalUsers / 1000000).toFixed(1)}M` : 
                   stats.totalUsers >= 1000 ? `${(stats.totalUsers / 1000).toFixed(1)}K` : 
                   stats.totalUsers.toString()}
            icon={<UsersIcon />}
            color="green"
            trend={{
              value: 83,
              label: "Growth",
              positive: true,
            }}
          />
        </div>

        {/* Tabs */}
        <Tabs
          tabs={[
            {
              id: "top-apps",
              label: "Top Applications",
              icon: (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              ),
              content: <LeaderboardTable entries={entries} />,
            },
            {
              id: "top-developers",
              label: "Top Developers",
              icon: (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              ),
              content: <LeaderboardTable entries={entries} developerData={developerData} showDevelopers={true} />,
            },
            {
              id: "category-leaders",
              label: "Category Leaders",
              icon: (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                </svg>
              ),
              content: <LeaderboardTable entries={entries} categoryData={categoryData} showCategories={true} />,
            },
          ]}
        />

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          Built with <span className="text-synheart-pink">❤</span> for wellness transparency
        </div>
      </div>
    </div>
  );
}
