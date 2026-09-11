// Config Package - Shared configuration and constants

export const APP_NAME = "BeatVision";
export const APP_VERSION = "0.1.0";

export const MAX_AUDIO_SIZE = 100 * 1024 * 1024; // 100MB
export const MAX_IMAGE_SIZE = 50 * 1024 * 1024; // 50MB

export const SUPPORTED_AUDIO_FORMATS = [
  "audio/mpeg",
  "audio/wav",
  "audio/ogg",
  "audio/mp4",
  "audio/flac",
  "audio/webm",
];

export const SUPPORTED_IMAGE_FORMATS = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/svg+xml",
  "image/gif",
];

export const DEFAULT_EXPORT_CONFIG = {
  format: "mp4" as const,
  aspectRatio: "16:9" as const,
  width: 1920,
  height: 1080,
  fps: 30,
  quality: "high" as const,
  includeAudio: true,
  startOffset: 0,
  endOffset: 0,
};
