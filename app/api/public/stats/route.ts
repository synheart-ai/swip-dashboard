/**
 * Public API - Platform Statistics
 * 
 * Get public platform statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../src/lib/db';

/**
 * GET /api/public/stats
 * 
 * Get platform-wide statistics
 * 
 * @swagger
 * /api/public/stats:
 *   get:
 *     summary: Get platform statistics
 *     description: Returns public platform-wide statistics
 *     tags:
 *       - Public
 *     responses:
 *       200:
 *         description: Platform statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalApps:
 *                   type: integer
 *                 totalDevelopers:
 *                   type: integer
 *                 totalSessions:
 *                   type: integer
 *                 avgSwipScore:
 *                   type: number
 *                 totalUsers:
 *                   type: integer
 */
export async function GET(request: NextRequest) {
  try {
    // Get counts
    const [totalApps, totalDevelopers, totalSessions, totalUsers] = await Promise.all([
      prisma.app.count(),
      prisma.user.count({
        where: {
          apps: {
            some: {}
          }
        }
      }),
      prisma.swipSession.count(),
      prisma.user.count()
    ]);

    // Get average SWIP score
    const avgSwipScoreResult = await prisma.swipSession.aggregate({
      _avg: {
        swipScore: true
      },
      where: {
        swipScore: {
          not: null
        }
      }
    });

    return NextResponse.json({
      totalApps,
      totalDevelopers,
      totalSessions,
      avgSwipScore: parseFloat((avgSwipScoreResult._avg.swipScore || 0).toFixed(2)),
      totalUsers
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200'
      }
    });
  } catch (error) {
    console.error('Error fetching platform stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}

