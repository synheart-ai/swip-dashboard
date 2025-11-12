/**
 * Individual Project API Route
 * 
 * GET: Get project details with stats
 * PATCH: Update project
 * DELETE: Delete project
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../src/lib/db';
import { requireUser } from '../../../../src/lib/auth';
import { z } from 'zod';

const UpdateProjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  status: z.enum(['active', 'archived', 'setup_incomplete']).optional(),
});

/**
 * GET /api/projects/[projectId]
 * 
 * Get project details with stats
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const user = await requireUser();
    const { projectId } = await params;

    const [project, counts] = await Promise.all([
      prisma.project.findUnique({
        where: { id: projectId },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          wearables: {
            take: 5,
            orderBy: { createdAt: 'desc' },
          },
          projectSessions: {
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: {
              appSession: {
                select: {
                  avgSwipScore: true,
                  startedAt: true,
                  dominantEmotion: true,
                },
              },
              wearable: {
                select: {
                  name: true,
                  deviceType: true,
                },
              },
            },
          },
        },
      }),
      prisma.project.findUnique({
        where: { id: projectId },
        select: {
          _count: {
            select: {
              wearables: true,
              projectSessions: true,
            },
          },
        },
      }),
    ]);

    if (!project || !counts) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    // Check ownership
    if (project.ownerId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Calculate average SWIP score
    const sessionsWithScores = project.projectSessions
      .map(ps => ps.appSession.avgSwipScore)
      .filter((score): score is number => score !== null && score !== undefined);
    
    const avgSwipScore = sessionsWithScores.length > 0
      ? sessionsWithScores.reduce((sum, score) => sum + score, 0) / sessionsWithScores.length
      : null;

    // Calculate recent activity (sessions from last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentSessions = project.projectSessions.filter(
      ps => ps.appSession.startedAt >= sevenDaysAgo
    ).length;

    return NextResponse.json({
      success: true,
      data: {
        ...project,
        stats: {
          wearablesCount: counts._count.wearables,
          sessionsCount: counts._count.projectSessions,
          avgSwipScore,
          recentSessions,
        },
      },
    });
  } catch (error: any) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch project',
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/projects/[projectId]
 * 
 * Update project
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const user = await requireUser();
    const { projectId } = await params;
    const body = await req.json();
    
    const data = UpdateProjectSchema.parse(body);

    // Check ownership
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

    const updated = await prisma.project.update({
      where: { id: projectId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    console.error('Error updating project:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to update project',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/projects/[projectId]
 * 
 * Delete project (cascades to wearables and project sessions)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const user = await requireUser();
    const { projectId } = await params;

    // Check ownership
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

    await prisma.project.delete({
      where: { id: projectId },
    });

    return NextResponse.json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to delete project',
      },
      { status: 500 }
    );
  }
}

