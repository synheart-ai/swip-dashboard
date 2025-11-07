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
    
    const sessions = await prisma.appSession.findMany({
      take: 100,
      orderBy: { createdAt: "desc" },
      select: {
        appSessionId: true,
        avgSwipScore: true,
        createdAt: true,
        app: { select: { name: true } },
        biosignals: {
          select: {
            emotions: {
              select: {
                dominantEmotion: true,
                createdAt: true,
              },
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
          orderBy: { timestamp: "desc" },
          take: 5,
        },
      },
    });

    const transformed = sessions.map((session) => {
      const recentEmotion = session.biosignals
        .flatMap((b) => b.emotions)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

      return {
        sessionId: session.appSessionId,
        swipScore: session.avgSwipScore,
        emotion: recentEmotion?.dominantEmotion ?? 'Unknown',
        createdAt: session.createdAt,
        app: { name: session.app?.name ?? 'Unknown App' },
      };
    });
    
    logInfo('Public sessions fetched', { count: transformed.length });
    return new NextResponse(JSON.stringify({ ok: true, data: transformed }), {
      headers: rateLimitHeaders(rl),
    });
  } catch (error) {
    logError(error as Error, { context: 'public:sessions:GET' });
    return NextResponse.json({ ok: false, error: "DB not configured" }, { status: 200 });
  }
}