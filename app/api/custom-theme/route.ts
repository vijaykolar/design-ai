import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET - Fetch all custom themes (user's own + public themes)
export async function GET(req: NextRequest) {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user || !user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const marketplace = searchParams.get("marketplace") === "true";

    let themes;

    if (marketplace) {
      // Fetch all public themes for the marketplace
      themes = await prisma.customTheme.findMany({
        where: {
          isPublic: true,
        },
        orderBy: [
          { likes: "desc" },
          { createdAt: "desc" },
        ],
      });
    } else {
      // Fetch user's own themes + public themes
      themes = await prisma.customTheme.findMany({
        where: {
          OR: [
            { userId: user.id },
            { isPublic: true },
          ],
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }

    return NextResponse.json(themes);
  } catch (error) {
    console.error("Failed to fetch custom themes:", error);
    return NextResponse.json(
      { error: "Failed to fetch custom themes" },
      { status: 500 }
    );
  }
}

// POST - Create a new custom theme
export async function POST(req: NextRequest) {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user || !user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, colors, isPublic, tags } = body;

    if (!name || !colors) {
      return NextResponse.json(
        { error: "Name and colors are required" },
        { status: 400 }
      );
    }

    // Convert colors object to CSS variables string
    const styleString = Object.entries(colors)
      .map(([key, value]) => `  --${key}: ${value};`)
      .join("\n");

    const theme = await prisma.customTheme.create({
      data: {
        userId: user.id,
        name,
        description: description || "",
        style: styleString,
        isPublic: isPublic || false,
        tags: tags || [],
      },
    });

    return NextResponse.json(theme, { status: 201 });
  } catch (error) {
    console.error("Failed to create custom theme:", error);
    return NextResponse.json(
      { error: "Failed to create custom theme" },
      { status: 500 }
    );
  }
}
