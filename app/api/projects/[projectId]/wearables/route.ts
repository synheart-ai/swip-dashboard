/**
 * Project Wearables API Route
 * 
 * GET: List all wearables for a project
 * POST: Add a new wearable to a project
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../src/lib/db';
import { requireUser } from '../../../../../src/lib/auth';
import { z } from 'zod';

const CreateWearableSchema = z.object({
  name: z.string().min(1).max(100),
  deviceType: z.string().min(1),
  model: z.string().optional(),
  deviceId: z.string().optional(),
  connectionStatus: z.enum(['connected', 'disconnected', 'needs_setup']).optional(),
  assignedUserId: z.string().optional(),
});

/**
 * GET /api/projects/[projectId]/wearables
 * 
 * List all wearables for a project
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
    const deviceType = searchParams.get('deviceType');
    const connectionStatus = searchParams.get('connectionStatus');

    const where: any = { projectId };
    if (deviceType) {
      where.deviceType = deviceType;
    }
    if (connectionStatus) {
      where.connectionStatus = connectionStatus;
    }

    const wearables = await prisma.wearable.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            projectSessions: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: wearables.map(w => ({
        ...w,
        sessionsCount: w._count.projectSessions,
      })),
      count: wearables.length,
    });
  } catch (error: any) {
    console.error('Error fetching wearables:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch wearables',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects/[projectId]/wearables
 * 
 * Add a new wearable to a project
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const user = await requireUser();
    const { projectId } = await params;
    const body = await req.json();
    
    const data = CreateWearableSchema.parse(body);

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

    const wearable = await prisma.wearable.create({
      data: {
        name: data.name,
        deviceType: data.deviceType,
        model: data.model,
        deviceId: data.deviceId,
        connectionStatus: data.connectionStatus || 'needs_setup',
        assignedUserId: data.assignedUserId,
        projectId,
      },
    });

    // Update project's lastActivityAt
    await prisma.project.update({
      where: { id: projectId },
      data: { lastActivityAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      data: wearable,
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

    console.error('Error creating wearable:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create wearable',
      },
      { status: 500 }
    );
  }
}

