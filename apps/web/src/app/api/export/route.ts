import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      projectId,
      format,
      resolution,
      fps,
      duration,
    } = body;

    if (!projectId || !format) {
      return NextResponse.json(
        { error: "projectId and format are required" },
        { status: 400 }
      );
    }

    // Verify project ownership via workspace
    const project = await db.project.findUnique({
      where: { id: projectId },
      include: { workspace: true },
    });

    if (!project || project.workspace.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // TODO: Check subscription limits for export duration

    // Determine dimensions from resolution
    const resolutionMap: Record<string, { width: number; height: number }> = {
      "720p": { width: 1280, height: 720 },
      "1080p": { width: 1920, height: 1080 },
      "1440p": { width: 2560, height: 1440 },
      "4k": { width: 3840, height: 2160 },
    };
    const dims = resolutionMap[resolution || "1080p"] || resolutionMap["1080p"];

    // Create render job
    const renderJob = await db.renderJob.create({
      data: {
        projectId,
        projectVersionId: project.activeVersionId || "default",
        userId: session.user.id,
        status: "queued",
        progress: 0,
        outputFormat: format || "mp4",
        width: dims.width,
        height: dims.height,
        fps: fps || 30,
        storageKey: null,
        errorCode: null,
        errorMessage: null,
        startedAt: null,
        completedAt: null,
      },
    });

    // TODO: Add to actual render queue (Redis, Bull, etc.)
    // For now, simulate processing
    console.log("Render job created:", renderJob.id);

    return NextResponse.json({ renderJob }, { status: 201 });
  } catch (error) {
    console.error("Create render job error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    const where: any = { userId: session.user.id };
    if (projectId) {
      where.projectId = projectId;
    }

    const renderJobs = await db.renderJob.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({ renderJobs });
  } catch (error) {
    console.error("Fetch render jobs error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
