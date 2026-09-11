import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Storage configuration
const storageConfig = {
  endpoint: process.env.STORAGE_ENDPOINT || "https://your-account.r2.cloudflarestorage.com",
  region: "auto",
  credentials: {
    accessKeyId: process.env.STORAGE_ACCESS_KEY || "",
    secretAccessKey: process.env.STORAGE_SECRET_KEY || "",
  },
};

const BUCKET_NAME = process.env.STORAGE_BUCKET || "beatvision-assets";
const PUBLIC_URL = process.env.STORAGE_PUBLIC_URL || "";

// Initialize S3 client (works with Cloudflare R2, AWS S3, MinIO, etc.)
const s3Client = new S3Client(storageConfig);

export interface UploadResult {
  key: string;
  url: string;
  size: number;
  checksum: string;
}

export interface StorageFile {
  key: string;
  size: number;
  lastModified: Date;
  contentType: string;
}

/**
 * Upload a file to storage
 */
export async function uploadFile(
  file: Buffer | Uint8Array | ReadableStream,
  key: string,
  contentType: string,
  metadata?: Record<string, string>
): Promise<UploadResult> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: contentType,
    Metadata: metadata,
    // For public files, set ACL
    ...(PUBLIC_URL && { ACL: "public-read" }),
  });

  const response = await s3Client.send(command);

  return {
    key,
    url: PUBLIC_URL ? `${PUBLIC_URL}/${key}` : "",
    size: Buffer.isBuffer(file) ? file.length : 0,
    checksum: response.ETag || "",
  };
}

/**
 * Generate a presigned URL for private file access
 */
export async function getPresignedUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  return getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Generate a presigned upload URL (for client-side uploads)
 */
export async function getPresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn: number = 3600
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Delete a file from storage
 */
export async function deleteFile(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  await s3Client.send(command);
}

/**
 * Check if a file exists
 */
export async function fileExists(key: string): Promise<boolean> {
  try {
    const command = new HeadObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
    return true;
  } catch (error: any) {
    if (error.name === "NotFound") {
      return false;
    }
    throw error;
  }
}

/**
 * Get file metadata
 */
export async function getFileMetadata(key: string): Promise<StorageFile | null> {
  try {
    const command = new HeadObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const response = await s3Client.send(command);

    return {
      key,
      size: response.ContentLength || 0,
      lastModified: response.LastModified || new Date(),
      contentType: response.ContentType || "application/octet-stream",
    };
  } catch (error: any) {
    if (error.name === "NotFound") {
      return null;
    }
    throw error;
  }
}

/**
 * Generate a unique storage key
 */
export function generateStorageKey(
  workspaceId: string,
  type: "audio" | "image" | "export" | "thumbnail",
  filename: string
): string {
  const timestamp = Date.now();
  const sanitizedName = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
  const randomId = Math.random().toString(36).substring(2, 8);
  return `${workspaceId}/${type}/${timestamp}-${randomId}-${sanitizedName}`;
}

/**
 * Get public URL for a file
 */
export function getPublicUrl(key: string): string {
  if (PUBLIC_URL) {
    return `${PUBLIC_URL}/${key}`;
  }
  // For R2 without custom domain, use the endpoint
  return `${storageConfig.endpoint}/${BUCKET_NAME}/${key}`;
}
