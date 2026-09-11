export interface User {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  planId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ProjectStatus = "draft" | "rendering" | "completed" | "failed";

export interface Project {
  id: string;
  workspaceId: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  duration: number | null;
  width: number;
  height: number;
  fps: number;
  audioAssetId: string | null;
  activeVersionId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type AssetType = "audio" | "image" | "logo";

export interface Asset {
  id: string;
  workspaceId: string;
  type: AssetType;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  storageKey: string;
  checksum: string;
  width: number | null;
  height: number | null;
  duration: number | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
}

export type VisualizerMode =
  | "logo-reactor"
  | "circular-spectrum"
  | "linear-spectrum"
  | "waveform"
  | "particle-field"
  | "cinematic-artwork"
  | "minimal-pulse"
  | "radial-equalizer"
  | "glitch-impact"
  | "ambient-gradient";

export interface SceneConfig {
  mode: VisualizerMode;
  background: {
    color: string;
    imageId: string | null;
  };
  layers: LayerConfig[];
  audioMapping: AudioMapping[];
  presetId: string | null;
}

export interface LayerConfig {
  id: string;
  type: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
  position: { x: number; y: number };
  scale: { x: number; y: number };
  rotation: number;
  blendMode: string;
}

export interface AudioMapping {
  source: "bass" | "mid" | "treble" | "volume" | "beat" | "centroid";
  target: string;
  min: number;
  max: number;
  smoothing: number;
}

export type AspectRatio = "16:9" | "9:16" | "1:1" | "4:5" | "custom";

export interface ExportConfig {
  format: "mp4" | "webm";
  aspectRatio: AspectRatio;
  width: number;
  height: number;
  fps: 24 | 30 | 60;
  quality: "low" | "medium" | "high";
  includeAudio: boolean;
  startOffset: number;
  endOffset: number;
}

export type RenderJobStatus =
  | "queued"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled";

export interface RenderJob {
  id: string;
  projectId: string;
  projectVersionId: string;
  status: RenderJobStatus;
  progress: number;
  outputFormat: string;
  width: number;
  height: number;
  fps: number;
  storageKey: string | null;
  errorCode: string | null;
  errorMessage: string | null;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
}

export interface AudioAnalysis {
  bpm: number;
  beatConfidence: number;
  duration: number;
  sampleRate: number;
  channels: number;
  rms: number;
  peak: number;
  spectralCentroid: number;
  beats: BeatMarker[];
  frequencyBands: FrequencyBands;
}

export interface BeatMarker {
  time: number;
  strength: number;
  isDownbeat: boolean;
}

export interface FrequencyBands {
  bass: number;
  lowMid: number;
  mid: number;
  highMid: number;
  treble: number;
}
