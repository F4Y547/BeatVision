import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const presets = await db.preset.findMany({
      where: {
        OR: [
          { createdBy: session.user.id },
          { isPublic: true },
        ],
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ presets });
  } catch (error) {
    console.error("Fetch presets error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, config, isPublic } = body;

    if (!name || !config) {
      return NextResponse.json(
        { error: "Name and config are required" },
        { status: 400 }
      );
    }

    const preset = await db.preset.create({
      data: {
        name,
        description: description || null,
        config: JSON.stringify(config),
        isPublic: isPublic || false,
        createdBy: session.user.id,
      },
    });

    return NextResponse.json({ preset }, { status: 201 });
  } catch (error) {
    console.error("Create preset error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
