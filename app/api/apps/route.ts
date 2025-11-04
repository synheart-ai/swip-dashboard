import { NextResponse } from "next/server";
import { requireUser } from "../../../src/lib/auth";
import { prisma } from "../../../src/lib/db";
import { rateLimit, rateLimitHeaders } from "../../../src/lib/ratelimit";
import { logError, logInfo } from "../../../src/lib/logger";
import { z } from "zod";

const CreateAppSchema = z.object({
  name: z.string().min(1).max(100),
  category: z.string().optional(),
  description: z.string().optional(),
  os: z.string().optional(),
  appId: z.string().optional(),
  iconUrl: z.string().optional(),
});

export async function GET(req: Request) {
  try {
    const rl = await rateLimit("apps:list", 60, 60_000);
    if (!rl.ok) {
      logInfo('Rate limit exceeded', { endpoint: 'apps:GET' });
      return NextResponse.json({ success: false, error: "Rate limit exceeded" }, { status: 429 });
    }
    
    const user = await requireUser(req);
    const { searchParams } = new URL(req.url);
    const claimableParam = searchParams.get('claimable');
    
    // Support filtering for claimable apps (SWIP-created, unclaimed)
    const where: any = claimableParam === 'true' 
      ? { claimable: true, ownerId: null }  // Claimable apps (not yet claimed)
      : { ownerId: user.id };  // User's owned apps
    
    const apps = await prisma.app.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    logInfo('Apps fetched', { userId: user.id, count: apps.length, claimable: claimableParam });
    return NextResponse.json(
      { success: true, apps },
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...rateLimitHeaders(rl)
        }
      }
    );
  } catch (error) {
    logError(error as Error, { context: 'apps:GET' });
    return NextResponse.json(
      { success: false, error: "Failed to fetch apps" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const rl = await rateLimit("apps:create", 20, 60_000);
    if (!rl.ok) {
      logInfo('Rate limit exceeded', { endpoint: 'apps:POST' });
      return NextResponse.json({ success: false, error: "Rate limit exceeded" }, { status: 429 });
    }
    
    const user = await requireUser(req);
    const body = await req.json();
    const { name, category, description, os, appId, iconUrl } = CreateAppSchema.parse(body);

    // Check if this is user's first app - promote to developer
    const existingApps = await prisma.app.count({
      where: { ownerId: user.id },
    });

    const app = await prisma.app.create({
      data: {
        name,
        category: category || null,
        description: description || null,
        os: os || null,
        appId: appId || null,
        iconUrl: iconUrl || null,
        ownerId: user.id,
      },
    });

    // If this is the first app, promote user to developer
    if (existingApps === 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: { isDeveloper: true },
      });
      logInfo('User promoted to developer', { userId: user.id });
    }

    logInfo('App created', { userId: user.id, appId: app.id, appName: name });
    return NextResponse.json(
      { success: true, app },
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...rateLimitHeaders(rl)
        }
      }
    );
  } catch (error) {
    logError(error as Error, { context: 'apps:POST' });
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid app data: " + error.errors[0].message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: "Failed to create app" },
      { status: 500 }
    );
  }
}