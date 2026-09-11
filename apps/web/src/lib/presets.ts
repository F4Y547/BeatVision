import type { VisualizerMode } from "@/types";

export interface PresetConfig {
  id: string;
  name: string;
  description: string;
  mode: VisualizerMode;
  background: {
    color: string;
    gradient?: string[];
  };
  intensity: number;
  glow: number;
  opacity: number;
  smoothing: number;
  colorScheme: string[];
  particleCount?: number;
  barCount?: number;
  rotationSpeed?: number;
  scaleMultiplier?: number;
  audioMapping: {
    source: string;
    target: string;
    min: number;
    max: number;
    smoothing: number;
  }[];
}

export const BUILT_IN_PRESETS: PresetConfig[] = [
  {
    id: "dark-trap",
    name: "Dark Trap",
    description: "Dark, moody visuals for trap beats",
    mode: "circular-spectrum",
    background: { color: "#0a0a0f" },
    intensity: 80,
    glow: 60,
    opacity: 90,
    smoothing: 0.85,
    colorScheme: ["#7c3aed", "#a855f7", "#c084fc"],
    barCount: 64,
    audioMapping: [
      { source: "bass", target: "scale", min: 0.8, max: 1.6, smoothing: 0.8 },
      { source: "bass", target: "glow", min: 0.2, max: 1, smoothing: 0.7 },
      { source: "mid", target: "rotation", min: 0, max: 0.5, smoothing: 0.9 },
    ],
  },
  {
    id: "neon-pulse",
    name: "Neon Pulse",
    description: "Bright neon colors pulsing to the beat",
    mode: "minimal-pulse",
    background: { color: "#0f0f23" },
    intensity: 70,
    glow: 80,
    opacity: 100,
    smoothing: 0.75,
    colorScheme: ["#00f5ff", "#ff00ff", "#ffff00"],
    audioMapping: [
      { source: "bass", target: "scale", min: 0.9, max: 1.4, smoothing: 0.7 },
      { source: "volume", target: "opacity", min: 0.5, max: 1, smoothing: 0.85 },
      { source: "treble", target: "glow", min: 0, max: 1, smoothing: 0.6 },
    ],
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk",
    description: "Futuristic glitch aesthetic",
    mode: "glitch-impact",
    background: { color: "#1a1a2e" },
    intensity: 90,
    glow: 70,
    opacity: 95,
    smoothing: 0.7,
    colorScheme: ["#00d4ff", "#ff3366", "#00ff88"],
    audioMapping: [
      { source: "bass", target: "intensity", min: 0.5, max: 1, smoothing: 0.6 },
      { source: "mid", target: "offset", min: 0, max: 1, smoothing: 0.8 },
      { source: "treble", target: "glitch", min: 0, max: 1, smoothing: 0.5 },
    ],
  },
  {
    id: "cinematic",
    name: "Cinematic",
    description: "Smooth, professional look",
    mode: "ambient-gradient",
    background: { color: "#111111" },
    intensity: 60,
    glow: 40,
    opacity: 100,
    smoothing: 0.95,
    colorScheme: ["#d4a574", "#8b6914", "#2c1810"],
    audioMapping: [
      { source: "volume", target: "brightness", min: 0.3, max: 0.8, smoothing: 0.95 },
      { source: "bass", target: "saturation", min: 0.5, max: 1, smoothing: 0.9 },
    ],
  },
  {
    id: "minimal-logo",
    name: "Minimal Logo",
    description: "Clean, focused logo display",
    mode: "logo-reactor",
    background: { color: "#000000" },
    intensity: 50,
    glow: 30,
    opacity: 100,
    smoothing: 0.9,
    colorScheme: ["#ffffff", "#888888", "#444444"],
    audioMapping: [
      { source: "bass", target: "scale", min: 0.95, max: 1.15, smoothing: 0.85 },
      { source: "beat", target: "flash", min: 0, max: 0.3, smoothing: 0.5 },
    ],
  },
  {
    id: "bass-reactor",
    name: "Bass Reactor",
    description: "Heavy bass visualization",
    mode: "radial-equalizer",
    background: { color: "#0d0d0d" },
    intensity: 100,
    glow: 90,
    opacity: 95,
    smoothing: 0.65,
    colorScheme: ["#ff4444", "#ff8800", "#ffcc00"],
    barCount: 48,
    audioMapping: [
      { source: "bass", target: "scale", min: 0.5, max: 2, smoothing: 0.6 },
      { source: "bass", target: "glow", min: 0.3, max: 1, smoothing: 0.5 },
      { source: "mid", target: "rotation", min: 0, max: 1, smoothing: 0.8 },
    ],
  },
  {
    id: "space-tunnel",
    name: "Space Tunnel",
    description: "Cosmic journey through particles",
    mode: "particle-field",
    background: { color: "#050510" },
    intensity: 70,
    glow: 60,
    opacity: 85,
    smoothing: 0.8,
    colorScheme: ["#4fc3f7", "#81d4fa", "#b3e5fc"],
    particleCount: 3000,
    audioMapping: [
      { source: "bass", target: "speed", min: 0.5, max: 2, smoothing: 0.7 },
      { source: "treble", target: "spread", min: 0.8, max: 1.5, smoothing: 0.85 },
      { source: "volume", target: "opacity", min: 0.4, max: 1, smoothing: 0.9 },
    ],
  },
  {
    id: "liquid-spectrum",
    name: "Liquid Spectrum",
    description: "Flowing liquid-like spectrum",
    mode: "circular-spectrum",
    background: { color: "#0a1628" },
    intensity: 75,
    glow: 70,
    opacity: 90,
    smoothing: 0.88,
    colorScheme: ["#00bcd4", "#0097a7", "#006064"],
    barCount: 96,
    audioMapping: [
      { source: "bass", target: "radius", min: 0.8, max: 1.3, smoothing: 0.85 },
      { source: "mid", target: "wave", min: 0, max: 0.5, smoothing: 0.9 },
      { source: "treble", target: "colorShift", min: 0, max: 1, smoothing: 0.95 },
    ],
  },
  {
    id: "glitch-impact",
    name: "Glitch Impact",
    description: "Aggressive glitch effects",
    mode: "glitch-impact",
    background: { color: "#0f0f0f" },
    intensity: 95,
    glow: 50,
    opacity: 100,
    smoothing: 0.6,
    colorScheme: ["#ff0040", "#00ff80", "#ffffff"],
    audioMapping: [
      { source: "beat", target: "glitch", min: 0, max: 1, smoothing: 0.3 },
      { source: "bass", target: "shake", min: 0, max: 0.5, smoothing: 0.4 },
      { source: "treble", target: "distortion", min: 0, max: 1, smoothing: 0.5 },
    ],
  },
  {
    id: "ambient-dream",
    name: "Ambient Dream",
    description: "Soft, ethereal atmosphere",
    mode: "ambient-gradient",
    background: { color: "#1a0a2e" },
    intensity: 40,
    glow: 50,
    opacity: 80,
    smoothing: 0.98,
    colorScheme: ["#e1bee7", "#ce93d8", "#9c27b0"],
    audioMapping: [
      { source: "volume", target: "brightness", min: 0.2, max: 0.6, smoothing: 0.98 },
      { source: "mid", target: "hue", min: 0, max: 0.3, smoothing: 0.97 },
    ],
  },
  {
    id: "retro-vhs",
    name: "Retro VHS",
    description: "Vintage VHS aesthetic",
    mode: "linear-spectrum",
    background: { color: "#1a1a1a" },
    intensity: 65,
    glow: 40,
    opacity: 90,
    smoothing: 0.8,
    colorScheme: ["#ff6b6b", "#ffd93d", "#6bcb77"],
    barCount: 32,
    audioMapping: [
      { source: "bass", target: "height", min: 0.5, max: 1.5, smoothing: 0.75 },
      { source: "volume", target: "noise", min: 0, max: 0.3, smoothing: 0.9 },
    ],
  },
  {
    id: "monochrome-studio",
    name: "Monochrome Studio",
    description: "Clean black and white",
    mode: "waveform",
    background: { color: "#0a0a0a" },
    intensity: 60,
    glow: 20,
    opacity: 100,
    smoothing: 0.92,
    colorScheme: ["#ffffff", "#cccccc", "#666666"],
    audioMapping: [
      { source: "volume", target: "thickness", min: 1, max: 3, smoothing: 0.88 },
      { source: "bass", target: "amplitude", min: 0.5, max: 1.5, smoothing: 0.85 },
    ],
  },
];

export function getPresetById(id: string): PresetConfig | undefined {
  return BUILT_IN_PRESETS.find((p) => p.id === id);
}

export function getPresetByName(name: string): PresetConfig | undefined {
  return BUILT_IN_PRESETS.find(
    (p) => p.name.toLowerCase() === name.toLowerCase()
  );
}
