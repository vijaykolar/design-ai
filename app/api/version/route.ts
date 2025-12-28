import { NextRequest, NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user || !user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    // Fetch versions for the project
    const versions = await prisma.version.findMany({
      where: {
        projectId,
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50, // Limit to last 50 versions
    });

    return NextResponse.json(versions);
  } catch (error) {
    console.error("Error fetching versions:", error);
    return NextResponse.json(
      { error: "Failed to fetch versions" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user || !user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { projectId, name, description, snapshot, action } = body;

    if (!projectId || !snapshot || !action) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create a new version
    const version = await prisma.version.create({
      data: {
        projectId,
        userId: user.id,
        name,
        description,
        snapshot,
        action,
      },
    });

    // Keep only the last 50 versions per project to avoid bloat
    const allVersions = await prisma.version.findMany({
      where: { projectId, userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    if (allVersions.length > 50) {
      const versionsToDelete = allVersions.slice(50);
      await prisma.version.deleteMany({
        where: {
          id: { in: versionsToDelete.map((v) => v.id) },
        },
      });
    }

    return NextResponse.json(version);
  } catch (error) {
    console.error("Error creating version:", error);
    return NextResponse.json(
      { error: "Failed to create version" },
      { status: 500 }
    );
  }
}
