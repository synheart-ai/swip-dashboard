/**
 * Developer Portal Page
 *
 * Main hub for developers to manage apps and API keys
 */

import { prisma } from "../../src/lib/db";
import { requireUser } from "../../src/lib/auth";
import { ModernDeveloperPortal } from "../../components/ModernDeveloperPortal";
import { AuthWrapper } from "../../components/AuthWrapper";

async function getDeveloperStats(userId: string) {
  try {
    // Get total apps
    const totalApps = await prisma.app.count({
      where: { ownerId: userId },
    });

    // Get total sessions (all time)
    const totalSessions = await prisma.appSession.count({
      where: {
        app: {
          ownerId: userId,
        },
      },
    });

    // Get API calls today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const apiCallsToday = await prisma.appSession.count({
      where: {
        app: {
          ownerId: userId,
        },
        createdAt: {
          gte: today,
        },
      },
    });

    // Get average SWIP score across all apps
    const sessions = await prisma.appSession.findMany({
      where: {
        app: {
          ownerId: userId,
        },
      },
      select: {
        avgSwipScore: true,
      },
    });
    
    const sessionsWithScore = sessions.filter(s => s.avgSwipScore !== null);
    const avgSwipScore = sessionsWithScore.length > 0
      ? sessionsWithScore.reduce((sum, s) => sum + (s.avgSwipScore || 0), 0) / sessionsWithScore.length
      : 0;

    return {
      totalApps,
      totalSessions,
      apiCallsToday,
      avgSwipScore,
    };
  } catch (error) {
    console.error("Failed to fetch developer stats:", error);
    return {
      totalApps: 0,
      totalSessions: 0,
      apiCallsToday: 0,
      avgSwipScore: 0,
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
        appSessions: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            avgSwipScore: true,
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
      status:
        app.apiKeys.length > 0 && app.appSessions.length > 0
          ? "Active"
          : "Inactive",
      problems: app.leaderboardSnapshots[0]?.avgScore < 60 ? ["Low Score"] : [],
      createdAt: app.createdAt,
      lastActivity: app.appSessions[0]?.createdAt || app.createdAt,
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
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 p-6">
      <div className="max-w-[1800px] mx-auto">
        <ModernDeveloperPortal 
          stats={stats}
          apps={apps}
          apiKeys={apiKeys}
          userId={user.id}
        />
      </div>
    </div>
  );
}
