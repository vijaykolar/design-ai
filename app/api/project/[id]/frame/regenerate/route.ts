import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { inngest } from "@/inngest/client";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const { frameId, prompt } = await req.json();

    const session = await getKindeServerSession();
    const user = await session.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!frameId || !prompt) {
      return NextResponse.json(
        { error: "Frame ID and prompt are required" },
        { status: 400 }
      );
    }

    // Verify the project belongs to the user
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: user.id,
      },
      include: {
        frames: true,
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

    // Trigger the Inngest function for frame regeneration
    try {
      await inngest.send({
        name: "ui/regenerate.frame",
        data: {
          userId: user.id,
          projectId,
          frameId,
          prompt,
          theme: project.theme,
          existingFrames: project.frames,
        },
      });
    } catch (error) {
      console.error("Failed to trigger Inngest:", error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: "Frame regeneration started",
    });
  } catch (error) {
    console.error("Error regenerating frame:", error);
    return NextResponse.json(
      { error: "Failed to regenerate frame" },
      { status: 500 }
    );
  }
}
