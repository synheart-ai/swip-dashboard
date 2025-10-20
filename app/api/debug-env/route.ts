import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    AUTH_DEV_BYPASS: process.env.AUTH_DEV_BYPASS,
    NODE_ENV: process.env.NODE_ENV,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET ? "set" : "not set",
  });
}
