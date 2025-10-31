import { NextResponse } from "next/server";
import { auth } from "../../../../src/lib/auth";
import { prisma } from "../../../../src/lib/db";
import { headers } from "next/headers";

export async function PATCH(req: Request) {
  try {
    // Get the current user session using Better Auth API
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 },
      );
    }

    const { name } = await req.json();

    // Only allow name updates
    if (name !== undefined && typeof name !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Name must be a string",
        },
        { status: 400 },
      );
    }

    // Update only the name field
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name?.trim() || null,
      },
      select: { id: true, email: true, name: true },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update profile",
      },
      { status: 500 },
    );
  }
}
