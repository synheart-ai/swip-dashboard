import { NextResponse } from "next/server";
import { prisma } from "../../../../src/lib/db";
import { SwipIngestSchema, computeSwipScore, updateLeaderboard } from "../../../../src/lib/swip";
import { rateLimit, rateLimitHeaders } from "../../../../src/lib/ratelimit";
import { logError, logInfo } from "../../../../src/lib/logger";

async function findAppByKey(apiKey: string) {
  try {
    const key = await prisma.apiKey.findFirst({
      where: { key: apiKey, revoked: false },
      include: { app: true }
    });
    return key?.app ?? null;
  } catch (error) {
    logError(error as Error, { context: 'findAppByKey', apiKey: apiKey.slice(0, 8) + '...' });
    return null;
  }
}

export async function POST(req: Request) {
  const startTime = Date.now();
  
  try {
    // Basic IP/app rate limiting
    const ip = (req.headers.get("x-forwarded-for") || "")?.split(",")[0] || "unknown";
    const rl = await rateLimit(`ingest:${ip}`, 60, 60_000); // 60 req/min per IP
    if (!rl.ok) {
      logInfo('Rate limit exceeded', { ip, endpoint: 'swip/ingest' });
      return new NextResponse(JSON.stringify({ ok: false, error: "Rate limit exceeded" }), {
        status: 429,
        headers: {
          "content-type": "application/json",
          ...rateLimitHeaders(rl),
        },
      });
    }
    
    const apiKey = req.headers.get("x-api-key") || "";
    if (!apiKey) {
      logInfo('Missing API key', { ip, endpoint: 'swip/ingest' });
      return NextResponse.json({ ok: false, error: "Missing x-api-key" }, { status: 401 });
    }

    const app = await findAppByKey(apiKey);
    if (!app) {
      logInfo('Invalid API key', { ip, endpoint: 'swip/ingest', apiKey: apiKey.slice(0, 8) + '...' });
      return NextResponse.json({ ok: false, error: "Invalid API key" }, { status: 401 });
    }

    const json = await req.json();
    const parsed = SwipIngestSchema.safeParse(json);
    if (!parsed.success) {
      logInfo('Invalid request data', { 
        ip, 
        endpoint: 'swip/ingest', 
        appId: app.id,
        errors: parsed.error.flatten() 
      });
      return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
    }

    const payload = parsed.data;
    const score = computeSwipScore(payload);

    try {
      await prisma.swipSession.create({
        data: {
          appId: app.id,
          sessionId: payload.session_id,
          swipScore: score,
          hrData: payload.metrics.hr ? { hr: payload.metrics.hr, rr: payload.metrics.rr } : undefined,
          hrvMetrics: payload.metrics.hrv as any,
          emotion: payload.metrics.emotion
        }
      });

      // Update leaderboard asynchronously (don't wait for it)
      updateLeaderboard().catch((error) => {
        logError(error as Error, { context: 'updateLeaderboard', appId: app.id });
      });
      
      const duration = Date.now() - startTime;
      logInfo('Session created successfully', { 
        appId: app.id, 
        sessionId: payload.session_id, 
        score,
        duration 
      });
      
    } catch (error) {
      logError(error as Error, { 
        context: 'createSession', 
        appId: app.id, 
        sessionId: payload.session_id 
      });
      return NextResponse.json({ ok: false, error: "Failed to save session" }, { status: 500 });
    }

    return new NextResponse(JSON.stringify({ ok: true, swip_score: score }), {
      headers: rateLimitHeaders(rl),
    });
    
  } catch (error) {
    logError(error as Error, { context: 'swipIngest', duration: Date.now() - startTime });
    return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 });
  }
}