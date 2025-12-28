import { NextRequest, NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user || !user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: versionId } = await params;

    // Fetch the version
    const version = await prisma.version.findUnique({
      where: { id: versionId },
    });

    if (!version) {
      return NextResponse.json({ error: "Version not found" }, { status: 404 });
    }

    if (version.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Parse the snapshot
    let snapshot;
    try {
      snapshot = JSON.parse(version.snapshot);
    } catch (parseError) {
      console.error("Error parsing snapshot:", parseError);
      return NextResponse.json(
        { error: "Invalid snapshot data" },
        { status: 400 }
      );
    }

    // Update the project with the snapshot data
    try {
      await prisma.project.update({
        where: { id: version.projectId },
        data: {
          theme: snapshot.theme,
        },
      });
    } catch (updateError) {
      console.error("Error updating project:", updateError);
      return NextResponse.json(
        { error: "Failed to update project" },
        { status: 500 }
      );
    }

    // Delete existing frames
    try {
      await prisma.frame.deleteMany({
        where: { projectId: version.projectId },
      });
    } catch (deleteError) {
      console.error("Error deleting frames:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete existing frames" },
        { status: 500 }
      );
    }

    // Recreate frames from snapshot
    if (snapshot.frames && snapshot.frames.length > 0) {
      try {
        await prisma.frame.createMany({
          data: snapshot.frames.map(
            (frame: { id: string; title: string; htmlContent: string }) => ({
              projectId: version.projectId,
              title: frame.title,
              htmlContent: frame.htmlContent,
            })
          ),
        });
      } catch (createError) {
        console.error("Error creating frames:", createError);
        return NextResponse.json(
          { error: "Failed to create frames" },
          { status: 500 }
        );
      }
    }

    // Create a new version entry for the restore action
    await prisma.version.create({
      data: {
        projectId: version.projectId,
        userId: user.id,
        name: `Restored to: ${version.name || "version"}`,
        description: `Restored from ${new Date(
          version.createdAt
        ).toLocaleString()}`,
        snapshot: version.snapshot,
        action: "restore",
      },
    });

    // Fetch the updated project
    const updatedProject = await prisma.project.findUnique({
      where: { id: version.projectId },
      include: { frames: true },
    });

    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error("Error restoring version:", error);
    return NextResponse.json(
      { error: "Failed to restore version" },
      { status: 500 }
    );
  }
}
