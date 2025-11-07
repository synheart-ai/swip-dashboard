/**
 * App Claiming API
 * 
 * Allows developers to claim apps created by SWIP App
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../src/lib/db';
import { requireUser } from '../../../../../src/lib/auth';
import { z } from 'zod';
import { logger } from '../../../../../src/lib/logger';

const ClaimAppSchema = z.object({
  verificationMethod: z.enum(['package_name', 'screenshot', 'store_verification']),
  proof: z.string().min(1)  // Package name, URL, or verification code
});

/**
 * POST /api/apps/[id]/claim
 * 
 * Claim an app that was created by SWIP App
 * Requires session authentication
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require authenticated user
    const session = await requireUser(req);
    const { id } = await params;
    const body = await req.json();
    
    // Validate request body
    const { verificationMethod, proof } = ClaimAppSchema.parse(body);

    // Find the app
    const app = await prisma.app.findUnique({
      where: { id },
      include: {
        owner: true
      }
    });

    if (!app) {
      logger.warn('App not found for claiming', { appId: id, userId: session.id });
      return NextResponse.json(
        { success: false, error: 'App not found' },
        { status: 404 }
      );
    }

    // Check if app is claimable
    if (!app.claimable) {
      logger.warn('App is not claimable', { 
        appId: id, 
        userId: session.id,
        createdVia: app.createdVia 
      });
      return NextResponse.json(
        { 
          success: false, 
          error: 'App is not claimable. Only apps created by SWIP App can be claimed.' 
        },
        { status: 400 }
      );
    }

    // Check if app is already claimed
    if (app.ownerId) {
      logger.warn('App already claimed', { 
        appId: id, 
        currentOwner: app.ownerId,
        attemptBy: session.id 
      });
      return NextResponse.json(
        { 
          success: false, 
          error: 'App has already been claimed by another developer' 
        },
        { status: 409 }
      );
    }

    // Verify ownership based on method
    let verificationSuccess = false;
    let verificationMessage = '';

    switch (verificationMethod) {
      case 'package_name':
        // Simple verification: proof must match app's appId
        if (proof === app.appId) {
          verificationSuccess = true;
          verificationMessage = 'Package name verified';
        } else {
          verificationMessage = `Package name mismatch. Expected: ${app.appId}, Got: ${proof}`;
        }
        break;

      case 'screenshot':
        // For now, accept any URL as proof (can be enhanced with image verification)
        if (proof.startsWith('http://') || proof.startsWith('https://')) {
          verificationSuccess = true;
          verificationMessage = 'Screenshot URL accepted';
        } else {
          verificationMessage = 'Invalid screenshot URL';
        }
        break;

      case 'store_verification':
        // Store verification code (can be enhanced with actual store API verification)
        if (proof.length >= 10) {
          verificationSuccess = true;
          verificationMessage = 'Verification code accepted';
        } else {
          verificationMessage = 'Invalid verification code';
        }
        break;
    }

    if (!verificationSuccess) {
      logger.warn('App claim verification failed', { 
        appId: id,
        userId: session.id,
        method: verificationMethod,
        message: verificationMessage
      });
      return NextResponse.json(
        { 
          success: false, 
          error: 'Verification failed',
          message: verificationMessage
        },
        { status: 403 }
      );
    }

    // Claim the app
    const updatedApp = await prisma.app.update({
      where: { id },
      data: {
        ownerId: session.id,
        claimedAt: new Date(),
        claimable: false  // No longer claimable
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    logger.info('App claimed successfully', {
      appId: id,
      userId: session.id,
      method: verificationMethod,
      appName: app.name
    });

    return NextResponse.json({
      success: true,
      message: 'App claimed successfully',
      app: {
        id: updatedApp.id,
        name: updatedApp.name,
        appId: updatedApp.appId,
        category: updatedApp.category,
        claimedAt: updatedApp.claimedAt,
        owner: updatedApp.owner
      }
    }, {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error('Invalid claim request', { error: error.errors });
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request data',
          details: error.errors 
        },
        { status: 400 }
      );
    }

    logger.error('Error claiming app', { error });
    return NextResponse.json(
      { success: false, error: 'Failed to claim app' },
      { status: 500 }
    );
  }
}

