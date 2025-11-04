/**
 * Public API - Apps
 * 
 * Public endpoints for app statistics and data
 * No authentication required
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../src/lib/db';

/**
 * GET /api/public/apps
 * 
 * Get list of public apps with basic statistics
 * 
 * @swagger
 * /api/public/apps:
 *   get:
 *     summary: Get list of apps
 *     description: Returns a list of all registered apps with basic statistics (public endpoint)
 *     tags:
 *       - Public
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by app category
 *       - in: query
 *         name: os
 *         schema:
 *           type: string
 *           enum: [android, ios, web]
 *         description: Filter by operating system
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Maximum number of apps to return
 *     responses:
 *       200:
 *         description: List of apps
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 apps:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       category:
 *                         type: string
 *                       description:
 *                         type: string
 *                       os:
 *                         type: string
 *                       iconUrl:
 *                         type: string
 *                       totalSessions:
 *                         type: integer
 *                       avgSwipScore:
 *                         type: number
 *                       createdAt:
 *                         type: string
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const os = searchParams.get('os');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build where clause
    const where: any = {};
    if (category) where.category = category;
    if (os) where.os = os;

    // Get apps with session statistics
    const apps = await prisma.app.findMany({
      where,
      take: Math.min(limit, 100), // Max 100 apps
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        name: true,
        category: true,
        description: true,
        os: true,
        iconUrl: true,
        createdAt: true,
        appSessions: {
          select: {
            avgSwipScore: true
          }
        }
      }
    });

    // Calculate statistics for each app
    const appsWithStats = apps.map(app => {
      const sessions = app.appSessions;
      const totalSessions = sessions.length;
      const sessionsWithScore = sessions.filter(s => s.avgSwipScore !== null);
      const avgSwipScore = sessionsWithScore.length > 0
        ? sessionsWithScore.reduce((sum, s) => sum + (s.avgSwipScore || 0), 0) / sessionsWithScore.length
        : 0;

      return {
        id: app.id,
        name: app.name,
        category: app.category,
        description: app.description,
        os: app.os,
        iconUrl: app.iconUrl,
        totalSessions,
        avgSwipScore: parseFloat(avgSwipScore.toFixed(2)),
        createdAt: app.createdAt.toISOString()
      };
    });

    return NextResponse.json({
      apps: appsWithStats,
      total: appsWithStats.length
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    });
  } catch (error) {
    console.error('Error fetching public apps:', error);
    return NextResponse.json(
      { error: 'Failed to fetch apps' },
      { status: 500 }
    );
  }
}

