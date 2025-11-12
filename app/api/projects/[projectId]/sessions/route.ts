/**
 * Project Sessions API Route
 * 
 * GET: List all sessions for a project with filtering
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../src/lib/db';
import { requireUser } from '../../../../../src/lib/auth';

/**
 * GET /api/projects/[projectId]/sessions
 * 
 * List all sessions for a project with filtering
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const user = await requireUser();
    const { projectId } = await params;

    // Verify project ownership
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { ownerId: true },
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    if (project.ownerId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const wearableId = searchParams.get('wearableId');
    const emotion = searchParams.get('emotion');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause
    const where: any = { projectId };
    
    if (wearableId) {
      where.wearableId = wearableId;
    }

    if (emotion) {
      where.appSession = {
        dominantEmotion: emotion,
      };
    }

    if (startDate || endDate) {
      where.appSession = {
        ...where.appSession,
        startedAt: {},
      };
      if (startDate) {
        where.appSession.startedAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.appSession.startedAt.lte = new Date(endDate);
      }
    }

    const [sessions, total] = await Promise.all([
      prisma.projectSession.findMany({
        where,
        include: {
          wearable: {
            select: {
              id: true,
              name: true,
              deviceType: true,
            },
          },
          appSession: {
            select: {
              avgSwipScore: true,
              startedAt: true,
              endedAt: true,
              duration: true,
              dominantEmotion: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.projectSession.count({ where }),
    ]);

    // Calculate summary statistics
    const scores = sessions
      .map(s => s.appSession.avgSwipScore)
      .filter((score): score is number => score !== null && score !== undefined);
    
    const avgSwipScore = scores.length > 0
      ? scores.reduce((sum, score) => sum + score, 0) / scores.length
      : null;

    const emotions = sessions
      .map(s => s.appSession.dominantEmotion)
      .filter((e): e is string => e !== null && e !== undefined);
    
    const emotionCounts = emotions.reduce((acc, emotion) => {
      acc[emotion] = (acc[emotion] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      success: true,
      data: sessions,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
      stats: {
        avgSwipScore,
        emotionCounts,
        totalSessions: total,
      },
    });
  } catch (error: any) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch sessions',
      },
      { status: 500 }
    );
  }
}

