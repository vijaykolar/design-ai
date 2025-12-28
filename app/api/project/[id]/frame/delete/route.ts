import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(
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

    // Verify the frame belongs to the project
    const frame = await prisma.frame.findFirst({
      where: {
        id: frameId,
        projectId: projectId,
      },
    });

    if (!frame) {
      return NextResponse.json(
        { error: "Frame not found" },
        { status: 404 }
      );
    }

    // Delete the frame
    await prisma.frame.delete({
      where: {
        id: frameId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Frame deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting frame:", error);
    return NextResponse.json(
      { error: "Failed to delete frame" },
      { status: 500 }
    );
  }
}
