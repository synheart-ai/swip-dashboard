import { NextResponse } from "next/server";
import { prisma } from "../../../src/lib/db";

export async function GET() {
  try {
    // Create dev user
    const devUser = await prisma.user.upsert({
      where: { email: "dev@synheart.ai" },
      update: {},
      create: {
        email: "dev@synheart.ai",
        name: "Israel Goytom",
        password: "dev-password",
      },
    });
    
    return NextResponse.json({ 
      success: true, 
      user: { id: devUser.id, email: devUser.email, name: devUser.name } 
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
