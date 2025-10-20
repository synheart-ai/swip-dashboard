import { NextResponse } from "next/server";
import { auth } from "../../../src/lib/auth";
import { prisma } from "../../../src/lib/db";

export async function GET() {
  try {
    // Test database connection
    const dbTest = await prisma.user.count();
    
    // Test Better Auth configuration
    const authConfig = {
      hasSecret: !!process.env.BETTER_AUTH_SECRET,
      hasUrl: !!process.env.BETTER_AUTH_URL,
      hasDatabase: !!auth.options.database,
      hasEmailAndPassword: !!auth.options.emailAndPassword,
      emailAndPasswordEnabled: auth.options.emailAndPassword?.enabled,
      requireEmailVerification: auth.options.emailAndPassword?.requireEmailVerification,
    };
    
    return NextResponse.json({
      databaseConnected: true,
      userCount: dbTest,
      authConfig,
      message: "Configuration test completed"
    });
  } catch (error) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack,
      message: "Configuration test failed"
    }, { status: 500 });
  }
}
