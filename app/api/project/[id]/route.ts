import prisma from "@/lib/prisma";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getKindeServerSession();
    const user = await session.getUser();
    if (!user) throw new Error("Unauthorized");

    const project = await prisma.project.findFirst({
      where: {
        id,
        userId: user.id,
      },
      include: {
        frames: true,
      },
    });
    if (!project) throw new Error("Project not found");
    return NextResponse.json({
      success: true,
      data: project,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: (error as unknown as Error).message || "Failed to fetch project",
    });
  }
}
