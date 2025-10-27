/**
 * Developer Portal Page
 *
 * Main hub for developers to manage apps and API keys
 */

import { prisma } from "../../src/lib/db";
import { requireUser } from "../../src/lib/auth";
import { StatsCard } from "../../components/ui/StatsCard";
import { Tabs } from "../../components/ui/Tabs";
import { DeveloperAppsTable } from "../../components/DeveloperAppsTable";
import { DeveloperApiKeysTable } from "../../components/DeveloperApiKeysTable";
import { AuthWrapper } from "../../components/AuthWrapper";

// Icon components
function AppsIcon() {
  return (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
    </svg>
  );
}

function KeysIcon() {
  return (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
    </svg>
  );
}

function CallsIcon() {
  return (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
    </svg>
  );
}

function UptimeIcon() {
  return (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
    </svg>
  );
}

async function getDeveloperStats(userId: string) {
  try {
    // Get total apps
    const totalApps = await prisma.app.count({
      where: { ownerId: userId },
    });

    // Get active API keys
    const activeKeys = await prisma.apiKey.count({
      where: {
        userId,
        revoked: false,
      },
    });

    // Get API calls today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const apiCallsToday = await prisma.swipSession.count({
      where: {
        app: {
          ownerId: userId,
        },
        createdAt: {
          gte: today,
        },
      },
    });

    // Calculate uptime (mock for now - would need monitoring system)
    const uptime = 99.4;

    return {
      totalApps,
      activeKeys,
      apiCallsToday,
      uptime,
    };
  } catch (error) {
    console.error("Failed to fetch developer stats:", error);
    return {
      totalApps: 0,
      activeKeys: 0,
      apiCallsToday: 0,
      uptime: 0,
    };
  }
}

async function getAppsWithDetails(userId: string) {
  try {
    const apps = await prisma.app.findMany({
      where: { ownerId: userId },
      include: {
        apiKeys: {
          where: { revoked: false },
          select: {
            id: true,
            preview: true,
            createdAt: true,
            lastUsed: true,
          },
        },
        swipSessions: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            swipScore: true,
            createdAt: true,
          },
        },
        leaderboardSnapshots: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            avgScore: true,
            sessions: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return apps.map((app) => ({
      id: app.id,
      name: app.name,
      swipScore: app.leaderboardSnapshots[0]?.avgScore || 0,
      apiKey: app.apiKeys[0]?.preview || "No key",
      sessions: app.leaderboardSnapshots[0]?.sessions || 0,
      status: app.apiKeys.length > 0 && app.swipSessions.length > 0 ? "Active" : "Inactive",
      problems: app.leaderboardSnapshots[0]?.avgScore < 60 ? ["Low Score"] : [],
      createdAt: app.createdAt,
      lastActivity: app.swipSessions[0]?.createdAt || app.createdAt,
    }));
  } catch (error) {
    console.error("Failed to fetch apps:", error);
    return [];
  }
}

async function getApiKeysWithDetails(userId: string) {
  try {
    const apiKeys = await prisma.apiKey.findMany({
      where: { userId },
      include: {
        app: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return apiKeys.map((key) => ({
      id: key.id,
      preview: key.preview,
      appName: key.app.name,
      createdAt: key.createdAt,
      lastUsed: key.lastUsed,
      revoked: key.revoked,
    }));
  } catch (error) {
    console.error("Failed to fetch API keys:", error);
    return [];
  }
}

export default async function DeveloperPortal() {
  return (
    <AuthWrapper>
      <DeveloperPortalContent />
    </AuthWrapper>
  );
}

async function DeveloperPortalContent() {
  // Get authenticated user
  const user = await requireUser();

  const stats = await getDeveloperStats(user.id);
  const apps = await getAppsWithDetails(user.id);
  const apiKeys = await getApiKeysWithDetails(user.id);

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Developer Portal</h1>
          <p className="text-gray-400">
            Register apps, manage API keys, see ingestion logs.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Apps"
            value={stats.totalApps.toString()}
            icon={<AppsIcon />}
            color="pink"
            trend={{
              value: 3,
              label: "New this month",
              positive: true,
            }}
          />
          <StatsCard
            title="Active Keys"
            value={stats.activeKeys.toString()}
            icon={<KeysIcon />}
            color="purple"
            trend={{
              value: 5,
              label: "Added Recently",
              positive: true,
            }}
          />
          <StatsCard
            title="API Calls Today"
            value={`${(stats.apiCallsToday / 1000000).toFixed(1)}M`}
            icon={<CallsIcon />}
            color="blue"
            trend={{
              value: -6,
              label: "New record",
              positive: false,
            }}
          />
          <StatsCard
            title="API Uptime"
            value={`${stats.uptime.toFixed(1)}%`}
            icon={<UptimeIcon />}
            color="green"
            trend={{
              value: 83,
              label: "Improvement",
              positive: true,
            }}
          />
        </div>

        {/* Tabs */}
        <Tabs
          tabs={[
            {
              id: "my-apps",
              label: "My Apps",
              icon: (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              ),
              content: <DeveloperAppsTable apps={apps} userId={user.id} />,
            },
            {
              id: "api-keys",
              label: "API Keys",
              icon: (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
                </svg>
              ),
              content: <DeveloperApiKeysTable apiKeys={apiKeys} apps={apps.map(a => ({ id: a.id, name: a.name }))} />,
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
