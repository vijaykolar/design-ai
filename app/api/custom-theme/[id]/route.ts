import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// PATCH - Update a custom theme
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user || !user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { name, description, colors, isPublic, tags } = body;

    // Check if theme exists and belongs to user
    const existingTheme = await prisma.customTheme.findUnique({
      where: { id },
    });

    if (!existingTheme) {
      return NextResponse.json({ error: "Theme not found" }, { status: 404 });
    }

    if (existingTheme.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Convert colors object to CSS variables string if provided
    let styleString = existingTheme.style;
    if (colors) {
      styleString = Object.entries(colors)
        .map(([key, value]) => `  --${key}: ${value};`)
        .join("\n");
    }

    const updatedTheme = await prisma.customTheme.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(colors && { style: styleString }),
        ...(isPublic !== undefined && { isPublic }),
        ...(tags && { tags }),
      },
    });

    return NextResponse.json(updatedTheme);
  } catch (error) {
    console.error("Failed to update custom theme:", error);
    return NextResponse.json(
      { error: "Failed to update custom theme" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a custom theme
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user || !user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if theme exists and belongs to user
    const existingTheme = await prisma.customTheme.findUnique({
      where: { id },
    });

    if (!existingTheme) {
      return NextResponse.json({ error: "Theme not found" }, { status: 404 });
    }

    if (existingTheme.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.customTheme.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete custom theme:", error);
    return NextResponse.json(
      { error: "Failed to delete custom theme" },
      { status: 500 }
    );
  }
}
