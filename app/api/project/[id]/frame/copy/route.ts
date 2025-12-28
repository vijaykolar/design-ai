import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const { frameId } = await req.json();

    const session = await getKindeServerSession();
    const user = await session.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!frameId) {
      return NextResponse.json(
        { error: "Frame ID is required" },
        { status: 400 }
      );
    }

    // Verify the project belongs to the user
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: user.id,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Get the frame to copy
    const frameToCopy = await prisma.frame.findFirst({
      where: {
        id: frameId,
        projectId: projectId,
      },
    });

    if (!frameToCopy) {
      return NextResponse.json(
        { error: "Frame not found" },
        { status: 404 }
      );
    }

    // Create a copy of the frame with position offset +100px on x-axis
    const newFrame = await prisma.frame.create({
      data: {
        title: `${frameToCopy.title} (Copy)`,
        htmlContent: frameToCopy.htmlContent,
        projectId: projectId,
        x: frameToCopy.x + 100,
        y: frameToCopy.y,
      },
    });

    return NextResponse.json({
      success: true,
      frame: newFrame,
    });
  } catch (error) {
    console.error("Error copying frame:", error);
    return NextResponse.json(
      { error: "Failed to copy frame" },
      { status: 500 }
    );
  }
}
