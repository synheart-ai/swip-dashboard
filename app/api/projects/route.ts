/**
 * Projects API Route
 * 
 * GET: List all projects for the authenticated user
 * POST: Create a new project
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../src/lib/db';
import { requireUser } from '../../../src/lib/auth';
import { z } from 'zod';

const CreateProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  status: z.enum(['active', 'archived', 'setup_incomplete']).optional(),
});

/**
 * GET /api/projects
 * 
 * List all projects for the authenticated user
 * Supports filtering by status and search by name
 */
export async function GET(req: NextRequest) {
  try {
    const user = await requireUser();
    
    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'lastActivityAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build where clause
    const where: any = {
      ownerId: user.id,
    };

    if (status && status !== 'all') {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Build orderBy
    const orderBy: any = {};
    if (sortBy === 'name') {
      orderBy.name = sortOrder;
    } else if (sortBy === 'createdAt') {
      orderBy.createdAt = sortOrder;
    } else {
      orderBy.lastActivityAt = sortOrder === 'desc' ? 'desc' : 'asc';
    }

    const projects = await prisma.project.findMany({
      where,
      orderBy,
      include: {
        _count: {
          select: {
            wearables: true,
            projectSessions: true,
          },
        },
        projectSessions: {
          include: {
            appSession: {
              select: {
                avgSwipScore: true,
              },
            },
          },
        },
      },
    });

    // Calculate stats for each project
    const projectsWithStats = projects.map(project => {
      const sessionsWithScores = project.projectSessions
        .map(ps => ps.appSession.avgSwipScore)
        .filter((score): score is number => score !== null && score !== undefined);
      
      const avgSwipScore = sessionsWithScores.length > 0
        ? sessionsWithScores.reduce((sum, score) => sum + score, 0) / sessionsWithScores.length
        : null;

      return {
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        lastActivityAt: project.lastActivityAt,
        ownerId: project.ownerId,
        stats: {
          wearablesCount: project._count.wearables,
          sessionsCount: project._count.projectSessions,
          avgSwipScore,
        },
      };
    });

    return NextResponse.json({
      success: true,
      data: projectsWithStats,
      count: projectsWithStats.length,
    });
  } catch (error: any) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch projects',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects
 * 
 * Create a new project
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();
    
    const data = CreateProjectSchema.parse(body);

    const project = await prisma.project.create({
      data: {
        name: data.name,
        description: data.description,
        status: data.status || 'active',
        ownerId: user.id,
        lastActivityAt: new Date(),
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...project,
        stats: {
          wearablesCount: 0,
          sessionsCount: 0,
          avgSwipScore: null,
        },
      },
    }, { status: 201 });
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

    console.error('Error creating project:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create project',
      },
      { status: 500 }
    );
  }
}

