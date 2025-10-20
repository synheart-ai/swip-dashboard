import { NextResponse } from "next/server";
import { auth } from "../../../src/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    console.log("Direct Better Auth test:", { email, passwordLength: password?.length, name });

    // Try to create user directly with Better Auth
    const result = await auth.api.signUpEmail({
      body: { email, password, name },
      headers: req.headers,
    });

    console.log("Direct result:", { 
      status: result.status, 
      hasData: !!result.data,
      error: result.data?.error,
      user: result.data?.user ? "created" : "not created"
    });

    return NextResponse.json({
      status: result.status,
      success: result.status === 200,
      error: result.data?.error,
      user: result.data?.user,
      message: "Direct Better Auth test completed"
    });
  } catch (error) {
    console.error("Direct test error:", error);
    return NextResponse.json({
      error: error.message,
      stack: error.stack,
      message: "Direct Better Auth test failed"
    }, { status: 500 });
  }
}
