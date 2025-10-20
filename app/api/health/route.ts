import { NextResponse } from "next/server";
import { prisma } from "../../../src/lib/db";
import { redis } from "../../../src/lib/redis";

export async function GET() {
  try {
    const checks = {
      database: false,
      redis: false,
      timestamp: new Date().toISOString(),
    };
    
    // Check database
    try {
      await prisma.$queryRaw`SELECT 1`;
      checks.database = true;
    } catch (error) {
      console.error('Database health check failed:', error);
    }
    
    // Check Redis Cloud connectivity
    try {
      await redis.ping();
      checks.redis = true;
    } catch (error) {
      console.error('Redis health check failed:', error);
      checks.redis = false;
    }
    
    // Consider healthy if database is working (Redis is optional for basic functionality)
    const isHealthy = checks.database;
    
    return NextResponse.json(checks, {
      status: isHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      { error: 'Health check failed', timestamp: new Date().toISOString() },
      { status: 503 }
    );
  }
}