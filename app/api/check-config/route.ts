import { NextResponse } from "next/server";
import { auth } from "../../../src/lib/auth";

export async function GET() {
  try {
    // Check Better Auth configuration
    const config = {
      secret: !!process.env.BETTER_AUTH_SECRET,
      url: !!process.env.BETTER_AUTH_URL,
      database: !!auth.options.database,
      emailAndPassword: auth.options.emailAndPassword,
      session: auth.options.session,
      user: auth.options.user,
    };
    
    return NextResponse.json({
      config,
      message: "Better Auth configuration check"
    });
  } catch (error) {
    return NextResponse.json({
      error: error.message,
      message: "Configuration check failed"
    }, { status: 500 });
  }
}
