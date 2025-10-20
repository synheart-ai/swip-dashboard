import { NextResponse } from "next/server";
import { requireUser } from "../../../src/lib/auth";
import { prisma } from "../../../src/lib/db";
import { rateLimit, rateLimitHeaders } from "../../../src/lib/ratelimit";
import { logError, logInfo } from "../../../src/lib/logger";
import { z } from "zod";

const CreateAppSchema = z.object({
  name: z.string().min(1).max(100),
});

export async function GET(req: Request) {
  try {
    const rl = await rateLimit("apps:list", 60, 60_000);
    if (!rl.ok) {
      logInfo('Rate limit exceeded', { endpoint: 'apps:GET' });
      return NextResponse.json({ success: false, error: "Rate limit exceeded" }, { status: 429 });
    }
    
    const user = await requireUser(req);
    const apps = await prisma.app.findMany({
      where: { ownerId: user.id },
      orderBy: { createdAt: "desc" },
    });

    logInfo('Apps fetched', { userId: user.id, count: apps.length });
    return new NextResponse(JSON.stringify({ success: true, apps }), { headers: rateLimitHeaders(rl) });
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
    const { name } = CreateAppSchema.parse(body);

    const app = await prisma.app.create({
      data: {
        name,
        ownerId: user.id,
      },
    });

    logInfo('App created', { userId: user.id, appId: app.id, appName: name });
    return new NextResponse(JSON.stringify({ success: true, app }), { headers: rateLimitHeaders(rl) });
  } catch (error) {
    logError(error as Error, { context: 'apps:POST' });
    return NextResponse.json(
      { success: false, error: "Failed to create app" },
      { status: 500 }
    );
  }
}