import { NextResponse } from "next/server";
import { auth } from "../../../src/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    console.log("Testing registration with:", { 
      email, 
      passwordLength: password?.length, 
      name,
      emailValid: email?.includes('@')
    });

    // Test different password lengths
    const testPasswords = [
      "123456", // 6 chars
      "1234567", // 7 chars  
      "12345678", // 8 chars
      "password123", // 12 chars
      "password123456789" // 18 chars
    ];

    const results = [];
    
    for (const testPassword of testPasswords) {
      try {
        const result = await auth.api.signUpEmail({
          body: { email: `test${testPassword.length}@example.com`, password: testPassword, name: "Test" },
          headers: new Headers(),
        });
        
        results.push({
          passwordLength: testPassword.length,
          status: result.status,
          error: result.data?.error,
          success: result.status === 200
        });
      } catch (error) {
        results.push({
          passwordLength: testPassword.length,
          error: error.message,
          success: false
        });
      }
    }

    return NextResponse.json({ results });
  } catch (error) {
    return NextResponse.json({ 
      error: error.message,
      message: "Test failed"
    }, { status: 500 });
  }
}
