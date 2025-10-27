/**
 * Statistics Functions
 * 
 * Functions to fetch real statistics from the database
 */

import { prisma } from "../src/lib/db";

export interface RegionalData {
  region: string;
  sessions: number;
  avgScore: number;
}

export interface DeviceData {
  platform: string;
  sessions: number;
  percentage: number;
}

export interface Statistics {
  activeUsers: string;
  sessionsTracked: string;
  platformIntegrations: string;
  wellnessImprovement: string;
  totalApiCalls: string;
  apiCallsGrowth: string;
  dataProcessingUptime: string;
  uptimeImprovement: string;
  avgResponseTime: string;
  responseTimeImprovement: string;
  regionalActivity: RegionalData[];
  deviceDistribution: DeviceData[];
}

export async function getStatistics(): Promise<Statistics> {
  try {
    // Get total users count
    const totalUsers = await prisma.user.count();

    // Get total sessions count
    const totalSessions = await prisma.swipSession.count();

    // Get total apps count
    const totalApps = await prisma.app.count();

    // Get average SWIP score from sessions
    const avgSwipScoreResult = await prisma.swipSession.aggregate({
      _avg: {
        swipScore: true,
      },
      where: {
        swipScore: {
          not: null,
        },
      },
    });
    const avgSwipScore = avgSwipScoreResult._avg.swipScore || 0;

    // Format numbers for display
    const formatNumber = (num: number): string => {
      if (num >= 1000000) {
        return `${(num / 1000000).toFixed(1)}M+`;
      } else if (num >= 1000) {
        return `${(num / 1000).toFixed(1)}K+`;
      } else {
        return num.toString();
      }
    };

    return {
      activeUsers: formatNumber(totalUsers),
      sessionsTracked: formatNumber(totalSessions),
      platformIntegrations: totalApps.toString().padStart(2, '0'),
      wellnessImprovement: `${Math.round(avgSwipScore)}%`,
      totalApiCalls: "0",
      apiCallsGrowth: "0%",
      dataProcessingUptime: "0%",
      uptimeImprovement: "0%",
      avgResponseTime: "0ms",
      responseTimeImprovement: "0%",
      regionalActivity: [],
      deviceDistribution: []
    };
  } catch (error) {
    console.error('Error fetching statistics:', error);
    
    // Return fallback data if database is unavailable
    return {
      activeUsers: "0",
      sessionsTracked: "0",
      platformIntegrations: "00",
      wellnessImprovement: "0%",
      totalApiCalls: "0",
      apiCallsGrowth: "0%",
      dataProcessingUptime: "0%",
      uptimeImprovement: "0%",
      avgResponseTime: "0ms",
      responseTimeImprovement: "0%",
      regionalActivity: [],
      deviceDistribution: []
    };
  }
}