import { NextResponse } from "next/server";
import { auth } from "../../../../src/lib/auth";

export async function GET(req: Request) {
  try {
    // Use Better Auth's session checking
    const result = await auth.api.getSession({
      headers: req.headers,
    });

    // Better Auth returns the result directly, not wrapped in data
    if (result.user) {
      return NextResponse.json({ 
        success: true, 
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name || undefined,
        }
      });
    }

    return NextResponse.json({ 
      success: false, 
      user: null 
    });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json({ 
      success: false, 
      user: null 
    }, { status: 500 });
  }
}
