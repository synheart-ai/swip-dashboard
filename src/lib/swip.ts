import { z } from "zod";
import { prisma } from "./db";

export const SwipIngestSchema = z.object({
  app_id: z.string(),
  session_id: z.string(),
  metrics: z.object({
    hr: z.array(z.number()).optional(),
    rr: z.array(z.number()).optional(),
    hrv: z.object({
      sdnn: z.number().optional(),
      rmssd: z.number().optional(),
    }).optional(),
    emotion: z.string().optional(),
    timestamp: z.string().optional(),
  })
});

export type SwipIngest = z.infer<typeof SwipIngestSchema>;

export function computeSwipScore(input: SwipIngest): number {
  // Enhanced SWIP scoring algorithm based on HRV metrics and emotional state
  let score = 50; // Base score
  
  const hrv = input.metrics.hrv;
  
  // HRV-based scoring (RMSSD is more sensitive to parasympathetic activity)
  if (hrv?.rmssd) {
    // RMSSD values: 20-60ms is typical range
    // Higher RMSSD indicates better autonomic balance
    if (hrv.rmssd > 40) score += Math.min((hrv.rmssd - 40) * 0.5, 25);
    else if (hrv.rmssd < 20) score -= Math.min((20 - hrv.rmssd) * 0.3, 15);
  }
  
  // SDNN scoring (overall HRV variability)
  if (hrv?.sdnn) {
    // SDNN values: 30-100ms is typical range
    if (hrv.sdnn > 50) score += Math.min((hrv.sdnn - 50) * 0.3, 20);
    else if (hrv.sdnn < 30) score -= Math.min((30 - hrv.sdnn) * 0.2, 10);
  }
  
  // Emotional state scoring
  const emotion = input.metrics.emotion?.toLowerCase();
  switch (emotion) {
    case "calm":
    case "relaxed":
    case "peaceful":
      score += 10;
      break;
    case "focused":
    case "concentrated":
      score += 5;
      break;
    case "stressed":
    case "anxious":
    case "tense":
      score -= 15;
      break;
    case "excited":
    case "energetic":
      score += 3;
      break;
    case "tired":
    case "exhausted":
      score -= 5;
      break;
  }
  
  // Heart rate variability bonus (if both HR and RR data available)
  if (input.metrics.hr && input.metrics.rr) {
    const hrVariance = calculateVariance(input.metrics.hr);
    const rrVariance = calculateVariance(input.metrics.rr);
    
    // Good variability indicates healthy autonomic function
    if (hrVariance > 0.1 && rrVariance > 0.1) {
      score += 5;
    }
  }
  
  return Math.max(0, Math.min(100, Math.round(score)));
}

function calculateVariance(values: number[]): number {
  if (values.length < 2) return 0;
  
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  
  return Math.sqrt(variance) / mean; // Coefficient of variation
}

export async function updateLeaderboard() {
  try {
    // Calculate leaderboard for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Get all apps with sessions in the last 30 days
    const appsWithSessions = await prisma.app.findMany({
      where: {
        swipSessions: {
          some: {
            createdAt: {
              gte: thirtyDaysAgo,
            },
          },
        },
      },
      include: {
        swipSessions: {
          where: {
            createdAt: {
              gte: thirtyDaysAgo,
            },
            swipScore: {
              not: null,
            },
          },
        },
      },
    });
    
    // Calculate average scores and session counts
    const leaderboardData = appsWithSessions.map((app) => {
      const validSessions = app.swipSessions.filter(s => s.swipScore !== null);
      const avgScore = validSessions.length > 0 
        ? validSessions.reduce((sum, s) => sum + (s.swipScore || 0), 0) / validSessions.length
        : 0;
      
      return {
        appId: app.id,
        avgScore,
        sessions: validSessions.length,
      };
    }).filter(item => item.sessions > 0); // Only include apps with sessions
    
    // Sort by average score (descending)
    leaderboardData.sort((a, b) => b.avgScore - a.avgScore);
    
    // Create or update leaderboard snapshots
    for (const item of leaderboardData) {
      await prisma.leaderboardSnapshot.upsert({
        where: {
          appId_window: {
            appId: item.appId,
            window: "30d",
          },
        },
        update: {
          avgScore: item.avgScore,
          sessions: item.sessions,
        },
        create: {
          appId: item.appId,
          avgScore: item.avgScore,
          sessions: item.sessions,
          window: "30d",
        },
      });
    }
    
    console.log(`Updated leaderboard with ${leaderboardData.length} apps`);
  } catch (error) {
    console.error("Error updating leaderboard:", error);
  }
}
