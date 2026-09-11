import { z } from "zod";

export const audioFileSchema = z.object({
  name: z.string(),
  size: z
    .number()
    .max(100 * 1024 * 1024, "File size must be less than 100MB"),
  type: z.string().refine(
    (type) =>
      [
        "audio/mpeg",
        "audio/wav",
        "audio/ogg",
        "audio/mp4",
        "audio/flac",
        "audio/webm",
      ].includes(type) || type.startsWith("audio/"),
    "Invalid audio format"
  ),
});

export const imageFileSchema = z.object({
  name: z.string(),
  size: z
    .number()
    .max(50 * 1024 * 1024, "File size must be less than 50MB"),
  type: z.string().refine(
    (type) =>
      [
        "image/png",
        "image/jpeg",
        "image/jpg",
        "image/webp",
        "image/svg+xml",
        "image/gif",
      ].includes(type),
    "Invalid image format"
  ),
});

export const projectSchema = z.object({
  name: z
    .string()
    .min(1, "Project name is required")
    .max(100, "Project name is too long"),
  description: z.string().max(500).optional(),
});

export const exportConfigSchema = z.object({
  format: z.enum(["mp4", "webm"]),
  aspectRatio: z.enum(["16:9", "9:16", "1:1", "4:5", "custom"]),
  width: z.number().min(320).max(3840),
  height: z.number().min(320).max(2160),
  fps: z.enum(["24", "30", "60"]).transform(Number),
  quality: z.enum(["low", "medium", "high"]),
  includeAudio: z.boolean(),
  startOffset: z.number().min(0),
  endOffset: z.number().min(0),
});

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type AudioFileInput = z.infer<typeof audioFileSchema>;
export type ImageFileInput = z.infer<typeof imageFileSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type ExportConfigInput = z.infer<typeof exportConfigSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
