import { NextResponse } from "next/server";
import { auth } from "../../../src/lib/auth";

export async function GET() {
  try {
    // Test if auth object has the expected methods
    const authMethods = Object.keys(auth);
    const apiMethods = auth.api ? Object.keys(auth.api) : [];
    
    return NextResponse.json({
      authMethods,
      apiMethods,
      hasApi: !!auth.api,
      hasLogin: !!(auth.api?.login),
      hasRegister: !!(auth.api?.register),
      hasGetSession: !!(auth.api?.getSession),
      hasSignOut: !!(auth.api?.signOut),
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
