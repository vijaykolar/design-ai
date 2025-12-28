import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const session = await getKindeServerSession();
    const user = await session.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get the original project with all frames
    const originalProject = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: user.id,
      },
      include: {
        frames: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!originalProject) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Create the duplicate project
    const duplicateProject = await prisma.project.create({
      data: {
        userId: user.id,
        name: `${originalProject.name} (Copy)`,
        theme: originalProject.theme,
        thumbnail: originalProject.thumbnail,
        frames: {
          create: originalProject.frames.map((frame) => ({
            title: frame.title,
            htmlContent: frame.htmlContent,
          })),
        },
      },
      include: {
        frames: true,
      },
    });

    return NextResponse.json({
      success: true,
      project: duplicateProject,
    });
  } catch (error) {
    console.error("Error duplicating project:", error);
    return NextResponse.json(
      { error: "Failed to duplicate project" },
      { status: 500 }
    );
  }
}
