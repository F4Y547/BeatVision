import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { uploadFile, generateStorageKey, getPublicUrl } from "@/lib/storage";

const MAX_AUDIO_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_IMAGE_SIZE = 50 * 1024 * 1024; // 50MB

const SUPPORTED_AUDIO_TYPES = [
  "audio/mpeg",
  "audio/wav",
  "audio/ogg",
  "audio/mp4",
  "audio/flac",
  "audio/webm",
];

const SUPPORTED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/svg+xml",
];

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const projectId = formData.get("projectId") as string | null;
    const type = formData.get("type") as "audio" | "image" | null;

    if (!file || !type) {
      return NextResponse.json(
        { error: "File and type are required" },
        { status: 400 }
      );
    }

    // Validate file type
    if (type === "audio" && !SUPPORTED_AUDIO_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Unsupported audio format" },
        { status: 400 }
      );
    }

    if (type === "image" && !SUPPORTED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Unsupported image format" },
        { status: 400 }
      );
    }

    // Validate file size
    const maxSize = type === "audio" ? MAX_AUDIO_SIZE : MAX_IMAGE_SIZE;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${maxSize / (1024 * 1024)}MB` },
        { status: 400 }
      );
    }

    // Get workspace
    const workspace = await db.workspace.findFirst({
      where: { ownerId: session.user.id },
    });

    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 }
      );
    }

    // Check storage limits based on plan
    // TODO: Get actual plan from subscription
    const maxStorageBytes = 1 * 1024 * 1024 * 1024; // 1GB for free tier
    
    const currentUsage = await db.asset.aggregate({
      where: { workspaceId: workspace.id },
      _sum: { sizeBytes: true },
    });
    
    const currentUsageBytes = currentUsage._sum.sizeBytes || 0;
    if (currentUsageBytes + file.size > maxStorageBytes) {
      return NextResponse.json(
        { error: "Storage limit exceeded. Please upgrade your plan." },
        { status: 403 }
      );
    }

    // Generate storage key
    const storageKey = generateStorageKey(workspace.id, type, file.name);

    // Upload file to storage
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const uploadResult = await uploadFile(
      fileBuffer,
      storageKey,
      file.type,
      {
        userId: session.user.id,
        workspaceId: workspace.id,
        originalName: file.name,
      }
    );

    // Calculate checksum
    const crypto = await import("crypto");
    const checksum = crypto.createHash("md5").update(fileBuffer).digest("hex");

    // Create asset record
    const asset = await db.asset.create({
      data: {
        workspaceId: workspace.id,
        type,
        originalName: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
        storageKey,
        checksum,
        width: null, // TODO: Extract image dimensions
        height: null,
        duration: null, // TODO: Extract audio duration
        metadata: JSON.stringify({
          url: getPublicUrl(storageKey),
        }),
      },
    });

    // If projectId provided, link to project
    if (projectId) {
      const updateData: any = {};
      if (type === "audio") {
        updateData.audioAssetId = asset.id;
      }
      
      if (Object.keys(updateData).length > 0) {
        await db.project.update({
          where: { id: projectId },
          data: updateData,
        });
      }
    }

    return NextResponse.json({ asset }, { status: 201 });
  } catch (error) {
    console.error("Upload error:", error);
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

    const workspace = await db.workspace.findFirst({
      where: { ownerId: session.user.id },
    });

    if (!workspace) {
      return NextResponse.json({ assets: [] });
    }

    const assets = await db.asset.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { createdAt: "desc" },
    });

    // Add public URLs to assets
    const assetsWithUrls = assets.map((asset) => ({
      ...asset,
      url: getPublicUrl(asset.storageKey),
    }));

    return NextResponse.json({ assets: assetsWithUrls });
  } catch (error) {
    console.error("Fetch assets error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
