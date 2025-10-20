import { NextResponse } from "next/server";
import { auth } from "../../../src/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    const result = await auth.api.signUpEmail({
      body: { email, password, name },
      headers: req.headers,
    });

    return NextResponse.json({
      status: result.status,
      hasData: !!result.data,
      dataKeys: result.data ? Object.keys(result.data) : null,
      data: result.data,
      headers: result.headers ? Object.keys(result.headers) : null,
      message: "Debug completed"
    });
  } catch (error) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack,
      message: "Debug failed"
    }, { status: 500 });
  }
}
