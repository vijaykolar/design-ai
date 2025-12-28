import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// POST - Like/Unlike a theme
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

    const { id } = await params;

    const theme = await prisma.customTheme.findUnique({
      where: { id },
    });

    if (!theme) {
      return NextResponse.json({ error: "Theme not found" }, { status: 404 });
    }

    const hasLiked = theme.likedBy.includes(user.id);

    let updatedTheme;
    if (hasLiked) {
      // Unlike
      updatedTheme = await prisma.customTheme.update({
        where: { id },
        data: {
          likes: Math.max(0, theme.likes - 1),
          likedBy: theme.likedBy.filter((userId) => userId !== user.id),
        },
      });
    } else {
      // Like
      updatedTheme = await prisma.customTheme.update({
        where: { id },
        data: {
          likes: theme.likes + 1,
          likedBy: [...theme.likedBy, user.id],
        },
      });
    }

    return NextResponse.json({
      liked: !hasLiked,
      likes: updatedTheme.likes,
    });
  } catch (error) {
    console.error("Failed to like/unlike theme:", error);
    return NextResponse.json(
      { error: "Failed to like/unlike theme" },
      { status: 500 }
    );
  }
}
