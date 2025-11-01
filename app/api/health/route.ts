// app/api/health/route.ts
import { NextResponse } from "next/server";
// keep your existing paths if these are correct in your repo structure
import { prisma } from "../../../src/lib/db";
import { redis } from "../../../src/lib/redis";

export const runtime = "nodejs";        // ioredis requires Node runtime (not Edge)
export const dynamic = "force-dynamic"; // never pre-render this route

export async function GET() {
  const checks: { database: boolean; redis: boolean; timestamp: string } = {
    database: false,
    redis: false,
    timestamp: new Date().toISOString(),
  };

  // 1) Database health
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = true;
  } catch (err) {
    console.error("Database health check failed:", err);
  }

  // 2) Redis health (optional)
  try {
    if (redis) {
      // Ensure socket is up because we use lazyConnect
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((redis as any).status !== "ready") {
        await redis.connect();
      }
      const pong = await redis.ping();
      checks.redis = pong === "PONG";
    } else {
      // REDIS_URL not configured => keep false but don't fail health
      checks.redis = false;
    }
  } catch (err) {
    console.error("Redis health check failed:", err);
    checks.redis = false;
  }

  // Consider healthy if DB is up; Redis is optional
  const isHealthy = checks.database;

  return NextResponse.json(checks, {
    status: isHealthy ? 200 : 503,
    headers: {
      // never cache a health endpoint
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}