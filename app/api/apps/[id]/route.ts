import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "../../../../src/lib/db";
import { requireUser } from "../../../../src/lib/auth";
import { rateLimit, rateLimitHeaders } from "../../../../src/lib/ratelimit";
import { logError, logInfo } from "../../../../src/lib/logger";

const UpdateSchema = z.object({ name: z.string().min(1).max(100) });

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const rl = await rateLimit("apps:update", 30, 60_000);
    if (!rl.ok) {
      logInfo('Rate limit exceeded', { endpoint: 'apps:PATCH' });
      return NextResponse.json({ success: false, error: "Rate limit exceeded" }, { status: 429 });
    }

    const user = await requireUser(req);
    const body = await req.json();
    const { name } = UpdateSchema.parse(body);

    // Ensure app belongs to user
    const app = await prisma.app.findFirst({ where: { id: params.id, ownerId: user.id } });
    if (!app) {
      logInfo('App not found or access denied', { userId: user.id, appId: params.id });
      return NextResponse.json({ success: false, error: "App not found" }, { status: 404 });
    }

    const updated = await prisma.app.update({ where: { id: params.id }, data: { name } });
    
    logInfo('App updated', { userId: user.id, appId: params.id, newName: name });
    return NextResponse.json({ success: true, app: updated }, { headers: rateLimitHeaders(rl) });
  } catch (error) {
    logError(error as Error, { context: 'apps:PATCH', appId: params.id });
    return NextResponse.json({ success: false, error: "Failed to update app" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const rl = await rateLimit("apps:delete", 15, 60_000);
    if (!rl.ok) {
      logInfo('Rate limit exceeded', { endpoint: 'apps:DELETE' });
      return NextResponse.json({ success: false, error: "Rate limit exceeded" }, { status: 429 });
    }

    const user = await requireUser(req);
    // Verify ownership
    const app = await prisma.app.findFirst({ where: { id: params.id, ownerId: user.id } });
    if (!app) {
      logInfo('App not found or access denied', { userId: user.id, appId: params.id });
      return NextResponse.json({ success: false, error: "App not found" }, { status: 404 });
    }

    // NOTE: Will cascade delete sessions/apiKeys via DB relations if configured; otherwise delete child records first
    await prisma.apiKey.deleteMany({ where: { appId: params.id } });
    await prisma.swipSession.deleteMany({ where: { appId: params.id } });
    await prisma.leaderboardSnapshot.deleteMany({ where: { appId: params.id } });
    await prisma.app.delete({ where: { id: params.id } });

    logInfo('App deleted', { userId: user.id, appId: params.id, appName: app.name });
    return NextResponse.json({ success: true }, { headers: rateLimitHeaders(rl) });
  } catch (error) {
    logError(error as Error, { context: 'apps:DELETE', appId: params.id });
    return NextResponse.json({ success: false, error: "Failed to delete app" }, { status: 500 });
  }
}