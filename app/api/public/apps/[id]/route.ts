/**
 * Public API - Single App
 * 
 * Get details and statistics for a specific app
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../src/lib/db';

/**
 * GET /api/public/apps/[id]
 * 
 * Get app details with statistics
 * 
 * @swagger
 * /api/public/apps/{id}:
 *   get:
 *     summary: Get app details
 *     description: Returns detailed information and statistics for a specific app
 *     tags:
 *       - Public
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: App ID
 *     responses:
 *       200:
 *         description: App details
 *       404:
 *         description: App not found
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const app = await prisma.app.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        category: true,
        description: true,
        os: true,
        appId: true,
        iconUrl: true,
        createdAt: true,
        appSessions: {
          include: {
            biosignals: {
              include: {
                emotions: {
                  orderBy: {
                    createdAt: 'desc',
                  },
                  take: 1,
                },
              },
            },
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 100 // Last 100 sessions for public view
        }
      }
    });

    if (!app) {
      return NextResponse.json(
        { error: 'App not found' },
        { status: 404 }
      );
    }

    // Calculate statistics
    const sessions = app.appSessions;
    const totalSessions = sessions.length;
    
    const sessionsWithScore = sessions.filter(s => s.avgSwipScore !== null);
    const avgSwipScore = sessionsWithScore.length > 0
      ? sessionsWithScore.reduce((sum, s) => sum + (s.avgSwipScore || 0), 0) / sessionsWithScore.length
      : 0;
    
    // Calculate stress rate from emotions
    const stressRateMap: Record<string, number> = {
      'Stressed': 80,
      'Anxious': 70,
      'Neutral': 20,
      'Happy': 10,
      'Amused': 10,
    };
    const allEmotions = sessions
      .flatMap(s => s.biosignals.flatMap(b => b.emotions))
      .map(e => stressRateMap[e.dominantEmotion] || 30);
    const avgStressRate = allEmotions.length > 0
      ? allEmotions.reduce((sum, r) => sum + r, 0) / allEmotions.length
      : 0;
    
    const sessionsWithDuration = sessions.filter(s => s.duration !== null);
    const avgDuration = sessionsWithDuration.length > 0
      ? sessionsWithDuration.reduce((sum, s) => sum + (s.duration || 0), 0) / sessionsWithDuration.length
      : 0;

    // Emotion distribution
    const emotionCounts: Record<string, number> = {};
    sessions.forEach(s => {
      const recentEmotion = s.biosignals
        .flatMap(b => b.emotions)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
      if (recentEmotion) {
        const emotion = recentEmotion.dominantEmotion.toLowerCase();
        emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
      }
    });

    return NextResponse.json({
      app: {
        id: app.id,
        name: app.name,
        category: app.category,
        description: app.description,
        os: app.os,
        appId: app.appId,
        iconUrl: app.iconUrl,
        createdAt: app.createdAt.toISOString()
      },
      statistics: {
        totalSessions,
        avgSwipScore: parseFloat(avgSwipScore.toFixed(2)),
        avgStressRate: parseFloat(avgStressRate.toFixed(2)),
        avgDuration: parseFloat(avgDuration.toFixed(2)),
        emotionDistribution: emotionCounts
      }
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
      }
    });
  } catch (error) {
    console.error('Error fetching app details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch app details' },
      { status: 500 }
    );
  }
}

