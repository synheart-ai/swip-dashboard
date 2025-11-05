import { NextResponse } from "next/server";
import { prisma } from "../../../../src/lib/db";
import { rateLimit, rateLimitHeaders } from "../../../../src/lib/ratelimit";
import { logError, logInfo } from "../../../../src/lib/logger";

export async function GET() {
  try {
    const rl = await rateLimit("public:sessions", 120, 60_000); // 120 req/min shared bucket
    if (!rl.ok) {
      logInfo('Rate limit exceeded', { endpoint: 'public:sessions:GET' });
      return new NextResponse(JSON.stringify({ ok: false, error: "Rate limit exceeded" }), {
        status: 429,
        headers: { "content-type": "application/json", ...rateLimitHeaders(rl) },
      });
    }
    
    const sessions = await prisma.swipSession.findMany({
      take: 100,
      orderBy: { createdAt: "desc" },
      select: {
        sessionId: true,
        swipScore: true,
        emotion: true,
        createdAt: true,
        app: { select: { name: true } }
      }
    });
    
    logInfo('Public sessions fetched', { count: sessions.length });
    return new NextResponse(JSON.stringify({ ok: true, data: sessions }), {
      headers: rateLimitHeaders(rl),
    });
  } catch (error) {
    logError(error as Error, { context: 'public:sessions:GET' });
    return NextResponse.json({ ok: false, error: "DB not configured" }, { status: 200 });
  }
}