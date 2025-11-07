import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "../../../../src/lib/auth";
import { prisma } from "../../../../src/lib/db";
import { rateLimit, rateLimitHeaders } from "../../../../src/lib/ratelimit";
import { logError, logInfo } from "../../../../src/lib/logger";

/**
 * PATCH /api/api-keys/[keyId]
 * Toggle API key status (revoke/reactivate)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ keyId: string }> }
) {
  try {
    const rl = await rateLimit("keys:update", 30, 60_000);
    if (!rl.ok) {
      logInfo('Rate limit exceeded', { endpoint: 'api-keys:PATCH' });
      return NextResponse.json(
        { success: false, error: "Rate limit exceeded" },
        { status: 429 }
      );
    }

    const user = await requireUser(req);
    const { keyId } = await params;
    const body = await req.json();
    const { action } = body; // 'revoke' or 'reactivate'

    // Find the API key and verify ownership
    const apiKey = await prisma.apiKey.findFirst({
      where: {
        id: keyId,
        app: {
          ownerId: user.id
        }
      },
      include: {
        app: true
      }
    });

    if (!apiKey) {
      logInfo('API key not found or access denied', { 
        userId: user.id, 
        keyId 
      });
      return NextResponse.json(
        { success: false, error: "API key not found or access denied" },
        { status: 404 }
      );
    }

    // Toggle revoke status based on action
    const newRevokedStatus = action === 'revoke' ? true : false;

    if (apiKey.revoked === newRevokedStatus) {
      return NextResponse.json(
        { 
          success: false, 
          error: `API key is already ${newRevokedStatus ? 'revoked' : 'active'}` 
        },
        { status: 400 }
      );
    }

    // Update the revoked status
    await prisma.apiKey.update({
      where: { id: keyId },
      data: {
        revoked: newRevokedStatus
      }
    });

    logInfo(`API key ${action}d`, { 
      userId: user.id, 
      keyId,
      appId: apiKey.appId,
      appName: apiKey.app.name,
      action
    });

    return new NextResponse(
      JSON.stringify({ 
        success: true, 
        message: `API key ${action}d successfully`,
        revoked: newRevokedStatus
      }),
      { headers: rateLimitHeaders(rl) }
    );

  } catch (error) {
    logError(error as Error, { context: 'apiKeys:PATCH' });
    return NextResponse.json(
      { success: false, error: "Failed to update API key" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/api-keys/[keyId]
 * Permanently delete an API key
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ keyId: string }> }
) {
  try {
    const rl = await rateLimit("keys:delete", 30, 60_000);
    if (!rl.ok) {
      logInfo('Rate limit exceeded', { endpoint: 'api-keys:DELETE' });
      return NextResponse.json(
        { success: false, error: "Rate limit exceeded" },
        { status: 429 }
      );
    }

    const user = await requireUser(req);
    const { keyId } = await params;

    // Find the API key and verify ownership
    const apiKey = await prisma.apiKey.findFirst({
      where: {
        id: keyId,
        app: {
          ownerId: user.id
        }
      },
      include: {
        app: true
      }
    });

    if (!apiKey) {
      logInfo('API key not found or access denied', { 
        userId: user.id, 
        keyId 
      });
      return NextResponse.json(
        { success: false, error: "API key not found or access denied" },
        { status: 404 }
      );
    }

    // Permanently delete the API key from database
    await prisma.apiKey.delete({
      where: { id: keyId }
    });

    logInfo('API key permanently deleted', { 
      userId: user.id, 
      keyId,
      appId: apiKey.appId,
      appName: apiKey.app.name
    });

    return new NextResponse(
      JSON.stringify({ 
        success: true, 
        message: "API key permanently deleted" 
      }),
      { headers: rateLimitHeaders(rl) }
    );

  } catch (error) {
    logError(error as Error, { context: 'apiKeys:DELETE' });
    return NextResponse.json(
      { success: false, error: "Failed to delete API key" },
      { status: 500 }
    );
  }
}

