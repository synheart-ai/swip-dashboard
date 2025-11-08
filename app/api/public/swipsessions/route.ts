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
              },
            },
          },
        },
      },
    });

    const transformed = sessions.map((session) => {
      const allEmotions = session.biosignals.flatMap((b) => b.emotions);
      let dominantEmotion = 'Unknown';

      if (allEmotions.length > 0) {
        const emotionCounts = allEmotions.reduce<Record<string, number>>((acc, emotion) => {
          const key = emotion.dominantEmotion?.toLowerCase() ?? 'unknown';
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {});

        let maxCount = 0;
        Object.entries(emotionCounts).forEach(([emotion, count]) => {
          if (count > maxCount) {
            dominantEmotion = emotion;
            maxCount = count;
          }
        });

        // convert back to display form (capitalize)
        if (dominantEmotion === 'unknown') {
          dominantEmotion = 'Unknown';
        } else {
          dominantEmotion = `${dominantEmotion.charAt(0).toUpperCase()}${dominantEmotion.slice(1)}`;
        }
      }

      return {
        sessionId: session.appSessionId,
        swipScore: session.avgSwipScore,
        emotion: dominantEmotion,
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