import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { inngest } from "@/inngest/client";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getKindeServerSession();
    const user = await session.getUser();

    if (!user) throw new Error("Unauthorized");

    const project = await prisma.project.findFirst({
      where: {
        userId: user.id,
        id: id,
      },
      include: {
        frames: true,
      },
    });

    if (!project) {
      return NextResponse.json(
        {
          error: "Project not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(project);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        error: "Fail to fetch project",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { prompt } = await request.json();
    const session = await getKindeServerSession();
    const user = await session.getUser();

    if (!user) throw new Error("Unauthorized");
    if (!prompt) throw new Error("Missing Prompt");

    const userId = user.id;
    const project = await prisma.project.findFirst({
      where: { id, userId: user.id },
      include: { frames: true },
    });

    if (!project) throw new Error("Project not found");

    //Trigger the Inngest
    try {
      await inngest.send({
        name: "ui/generate.screens",
        data: {
          userId,
          projectId: id,
          prompt,
          frames: project.frames,
          theme: project.theme,
        },
      });
    } catch (error) {
      console.log(error);
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.log("Error occured ", error);
    return NextResponse.json(
      {
        error: "Failed to generate frame",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { themeId } = await request.json();
    const session = await getKindeServerSession();
    const user = await session.getUser();

    if (!user) throw new Error("Unauthorized");
    if (!themeId) throw new Error("Missing Theme");

    const userId = user.id;

    const project = await prisma.project.update({
      where: { id, userId },
      data: {
        theme: themeId,
      },
    });

    return NextResponse.json({
      success: true,
      project,
    });
  } catch (error) {
    console.log("Error occured ", error);
    return NextResponse.json(
      {
        error: "Failed to update project",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getKindeServerSession();
    const user = await session.getUser();

    if (!user) throw new Error("Unauthorized");

    const userId = user.id;

    // Verify the project belongs to the user before deleting
    const project = await prisma.project.findFirst({
      where: { id, userId },
    });

    if (!project) {
      return NextResponse.json(
        {
          error: "Project not found",
        },
        { status: 404 }
      );
    }

    // Delete frames first (MongoDB doesn't support cascade delete)
    await prisma.frame.deleteMany({
      where: { projectId: id },
    });

    // Delete the project
    await prisma.project.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.log("Error occurred ", error);
    return NextResponse.json(
      {
        error: "Failed to delete project",
      },
      { status: 500 }
    );
  }
}
