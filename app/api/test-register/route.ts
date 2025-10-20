import { NextResponse } from "next/server";
import { auth } from "../../../src/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    console.log("Registration attempt:", { email, password: password ? "***" : "missing", name });

    // Use Better Auth's built-in register method
    const result = await auth.api.signUpEmail({
      body: { email, password, name },
      headers: req.headers,
    });

    console.log("Better Auth result:", { 
      status: result.status, 
      hasData: !!result.data,
      error: result.data?.error 
    });

    if (result.status === 200) {
      const response = NextResponse.json({ success: true, user: result.data.user });
      
      // Copy Better Auth cookies to response
      if (result.headers?.['set-cookie']) {
        result.headers['set-cookie'].forEach((cookie: string) => {
          response.headers.append('set-cookie', cookie);
        });
      }
      
      return response;
    } else {
      return NextResponse.json({ 
        success: false, 
        error: result.data?.error || "Registration failed" 
      }, { status: result.status });
    }
  } catch (e) {
    console.error("Registration error:", e);
    return NextResponse.json({ 
      success: false, 
      error: `Registration failed: ${e.message}` 
    }, { status: 500 });
  }
}
