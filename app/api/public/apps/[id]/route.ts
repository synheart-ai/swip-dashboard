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
        swipSessions: {
          select: {
            swipScore: true,
            stressRate: true,
            duration: true,
            emotion: true,
            createdAt: true
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
    const sessions = app.swipSessions;
    const totalSessions = sessions.length;
    const avgSwipScore = totalSessions > 0
      ? sessions.reduce((sum, s) => sum + (s.swipScore || 0), 0) / totalSessions
      : 0;
    const avgStressRate = totalSessions > 0
      ? sessions.reduce((sum, s) => sum + (s.stressRate || 0), 0) / totalSessions
      : 0;
    const avgDuration = totalSessions > 0
      ? sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / totalSessions
      : 0;

    // Emotion distribution
    const emotionCounts: Record<string, number> = {};
    sessions.forEach(s => {
      if (s.emotion) {
        emotionCounts[s.emotion] = (emotionCounts[s.emotion] || 0) + 1;
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

