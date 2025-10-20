import { NextResponse } from "next/server";
import { auth } from "../../../src/lib/auth";

export async function GET() {
  try {
    // Test if auth is properly configured
    const testResult = await auth.api.signUpEmail({
      body: { email: "test@test.com", password: "test123", name: "Test" },
      headers: new Headers(),
    });
    
    return NextResponse.json({
      status: testResult.status,
      hasData: !!testResult.data,
      error: testResult.data?.error,
      message: "Better Auth test completed"
    });
  } catch (error) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack,
      message: "Better Auth test failed"
    }, { status: 500 });
  }
}
