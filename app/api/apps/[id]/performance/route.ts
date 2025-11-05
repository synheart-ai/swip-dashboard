import { NextResponse } from "next/server";
import { requireUser } from "../../../../../src/lib/auth";
import { prisma } from "../../../../../src/lib/db";
import { logError, logInfo } from "../../../../../src/lib/logger";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser(req);
    const { id: appId } = await params;

    // Verify the app belongs to the user
    const app = await prisma.app.findFirst({
      where: { id: appId, ownerId: user.id },
    });

    if (!app) {
      return NextResponse.json(
        { success: false, error: "App not found or access denied" },
        { status: 404 }
      );
    }

    // Get current month and last month date ranges
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    // Get sessions for current month
    const currentMonthSessions = await prisma.appSession.findMany({
      where: {
        appInternalId: appId,
        createdAt: {
          gte: currentMonthStart,
        },
      },
      select: {
        avgSwipScore: true,
        createdAt: true,
      },
    });

    // Get sessions for last month
    const lastMonthSessions = await prisma.appSession.findMany({
      where: {
        appInternalId: appId,
        createdAt: {
          gte: lastMonthStart,
          lte: lastMonthEnd,
        },
      },
      select: {
        avgSwipScore: true,
      },
    });

    // Calculate metrics
    const currentMonthCount = currentMonthSessions.length;
    const lastMonthCount = lastMonthSessions.length;
    
    const currentMonthSessionsWithScore = currentMonthSessions.filter(s => s.avgSwipScore !== null);
    const currentMonthAvgScore = currentMonthSessionsWithScore.length > 0
      ? currentMonthSessionsWithScore.reduce((sum, s) => sum + (s.avgSwipScore || 0), 0) / currentMonthSessionsWithScore.length
      : 0;
    
    const lastMonthSessionsWithScore = lastMonthSessions.filter(s => s.avgSwipScore !== null);
    const lastMonthAvgScore = lastMonthSessionsWithScore.length > 0
      ? lastMonthSessionsWithScore.reduce((sum, s) => sum + (s.avgSwipScore || 0), 0) / lastMonthSessionsWithScore.length
      : 0;

    // Calculate percentage changes
    const sessionGrowth = lastMonthCount > 0
      ? ((currentMonthCount - lastMonthCount) / lastMonthCount) * 100
      : currentMonthCount > 0 ? 100 : 0;

    const scoreImprovement = lastMonthAvgScore > 0
      ? ((currentMonthAvgScore - lastMonthAvgScore) / lastMonthAvgScore) * 100
      : 0;

    // Get total API keys for this app
    const apiKeysCount = await prisma.apiKey.count({
      where: {
        appId: appId,
        revoked: false,
      },
    });

    // Calculate days since last activity
    const lastActivity = currentMonthSessions.length > 0
      ? currentMonthSessions[currentMonthSessions.length - 1].createdAt
      : app.createdAt;
    
    const daysSinceLastActivity = Math.floor(
      (now.getTime() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24)
    );

    // Calculate engagement rate (sessions per day this month)
    const daysInCurrentMonth = now.getDate();
    const engagementRate = daysInCurrentMonth > 0
      ? currentMonthCount / daysInCurrentMonth
      : 0;

    const performance = {
      sessions: {
        current: currentMonthCount,
        last: lastMonthCount,
        growth: Math.round(sessionGrowth * 10) / 10, // Round to 1 decimal
      },
      score: {
        current: Math.round(currentMonthAvgScore * 10) / 10,
        last: Math.round(lastMonthAvgScore * 10) / 10,
        improvement: Math.round(scoreImprovement * 10) / 10,
      },
      apiKeys: {
        active: apiKeysCount,
      },
      engagement: {
        rate: Math.round(engagementRate * 10) / 10,
        daysSinceLastActivity: daysSinceLastActivity,
      },
    };

    logInfo('App performance fetched', { userId: user.id, appId, performance });
    return NextResponse.json({ success: true, performance });
  } catch (error) {
    const { id: appId } = await params;
    logError(error as Error, { context: 'app:performance:GET', appId });
    return NextResponse.json(
      { success: false, error: "Failed to fetch app performance" },
      { status: 500 }
    );
  }
}

