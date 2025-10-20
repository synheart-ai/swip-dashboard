import { NextResponse } from "next/server";
import { requireUser } from "../../../src/lib/auth";
import { prisma } from "../../../src/lib/db";
import { rateLimit, rateLimitHeaders } from "../../../src/lib/ratelimit";
import { logError, logInfo } from "../../../src/lib/logger";
import { z } from "zod";
import { randomBytes } from "crypto";

const GenerateApiKeySchema = z.object({
  appId: z.string(),
});

export async function GET(req: Request) {
  try {
    const rl = await rateLimit("keys:list", 60, 60_000);
    if (!rl.ok) {
      logInfo('Rate limit exceeded', { endpoint: 'api-keys:GET' });
      return NextResponse.json({ success: false, error: "Rate limit exceeded" }, { status: 429 });
    }
    
    const user = await requireUser(req);
    const keys = await prisma.apiKey.findMany({
      where: { app: { ownerId: user.id } },
      include: { app: true },
      orderBy: { createdAt: "desc" },
    });
    
    logInfo('API keys fetched', { userId: user.id, count: keys.length });
    return new NextResponse(JSON.stringify({ success: true, keys }), { headers: rateLimitHeaders(rl) });
  } catch (error) {
    logError(error as Error, { context: 'apiKeys:GET' });
    return NextResponse.json(
      { success: false, error: "Failed to fetch API keys" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const rl = await rateLimit("keys:create", 15, 60_000);
    if (!rl.ok) {
      logInfo('Rate limit exceeded', { endpoint: 'api-keys:POST' });
      return NextResponse.json({ success: false, error: "Rate limit exceeded" }, { status: 429 });
    }
    
    const user = await requireUser(req);
    const body = await req.json();
    const { appId } = GenerateApiKeySchema.parse(body);

    // Verify the app belongs to the user
    const app = await prisma.app.findFirst({
      where: { id: appId, ownerId: user.id },
    });

    if (!app) {
      logInfo('App not found or access denied', { userId: user.id, appId });
      return NextResponse.json(
        { success: false, error: "App not found or access denied" },
        { status: 404 }
      );
    }

    // Generate a secure API key
    const apiKey = `swip_${randomBytes(32).toString("hex")}`;

    const key = await prisma.apiKey.create({
      data: {
        key: apiKey,
        appId: appId,
        userId: user.id,
      },
    });

    logInfo('API key created', { userId: user.id, appId, keyId: key.id });
    return new NextResponse(JSON.stringify({ success: true, apiKey: key.key }), { headers: rateLimitHeaders(rl) });
  } catch (error) {
    logError(error as Error, { context: 'apiKeys:POST' });
    return NextResponse.json(
      { success: false, error: "Failed to generate API key" },
      { status: 500 }
    );
  }
}