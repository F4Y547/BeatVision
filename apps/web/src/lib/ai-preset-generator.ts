import { z } from "zod";

export const AiPresetRequestSchema = z.object({
  mood: z.enum(["energetic", "calm", "dark", "uplifting", "aggressive", "dreamy", "retro", "futuristic"]),
  genre: z.enum(["edm", "hiphop", "rock", "pop", "jazz", "classical", "ambient", "lofi"]),
  intensity: z.number().min(0).max(1).default(0.5),
  colorPreference: z.enum(["warm", "cool", "neon", "pastel", "monochrome", "rainbow"]).optional(),
  complexity: z.enum(["simple", "moderate", "complex"]).default("moderate"),
});

export type AiPresetRequest = z.infer<typeof AiPresetRequestSchema>;

export interface AiGeneratedPreset {
  name: string;
  description: string;
  visualizerMode: string;
  colorPalette: string[];
  layerConfig: {
    type: string;
    config: Record<string, any>;
  }[];
  audioMapping: {
    source: string;
    target: string;
    amount: number;
    curve: string;
  }[];
  postProcessing: {
    bloom: number;
    vignette: number;
    noise: number;
    chromaticAberration: number;
  };
}

// Mood-based preset configurations
const MOOD_CONFIGS: Record<string, Partial<AiGeneratedPreset>> = {
  energetic: {
    visualizerMode: "circular-spectrum",
    colorPalette: ["#FF6B6B", "#FFA07A", "#FFD700", "#FF4500"],
    postProcessing: { bloom: 1.2, vignette: 0.2, noise: 0.05, chromaticAberration: 0.002 },
  },
  calm: {
    visualizerMode: "ambient-gradient",
    colorPalette: ["#667EEA", "#764BA2", "#6B8DD6", "#8E37D7"],
    postProcessing: { bloom: 0.6, vignette: 0.4, noise: 0.02, chromaticAberration: 0 },
  },
  dark: {
    visualizerMode: "glitch-impact",
    colorPalette: ["#1A1A2E", "#16213E", "#0F3460", "#E94560"],
    postProcessing: { bloom: 0.4, vignette: 0.7, noise: 0.15, chromaticAberration: 0.005 },
  },
  uplifting: {
    visualizerMode: "particle-field",
    colorPalette: ["#00D2FF", "#3A7BD5", "#00D2FF", "#7F00FF"],
    postProcessing: { bloom: 1.0, vignette: 0.1, noise: 0, chromaticAberration: 0 },
  },
  aggressive: {
    visualizerMode: "radial-equalizer",
    colorPalette: ["#FF0000", "#FF4400", "#FF8800", "#FFCC00"],
    postProcessing: { bloom: 1.5, vignette: 0.3, noise: 0.2, chromaticAberration: 0.008 },
  },
  dreamy: {
    visualizerMode: "waveform",
    colorPalette: ["#E0C3FC", "#8EC5FC", "#F093FB", "#F5576C"],
    postProcessing: { bloom: 1.8, vignette: 0.5, noise: 0.03, chromaticAberration: 0.001 },
  },
  retro: {
    visualizerMode: "linear-spectrum",
    colorPalette: ["#F09819", "#EDDE5D", "#FF512F", "#DD2476"],
    postProcessing: { bloom: 0.8, vignette: 0.6, noise: 0.12, chromaticAberration: 0.003 },
  },
  futuristic: {
    visualizerMode: "minimal-pulse",
    colorPalette: ["#00F5FF", "#00D4FF", "#0099FF", "#00FFAA"],
    postProcessing: { bloom: 1.0, vignette: 0.2, noise: 0.01, chromaticAberration: 0.004 },
  },
};

// Genre-based layer configurations
const GENRE_LAYERS: Record<string, AiGeneratedPreset["layerConfig"]> = {
  edm: [
    { type: "circular-spectrum", config: { radius: 0.5, segments: 128, lineWidth: 2 } },
    { type: "particle-field", config: { count: 2000, speed: 2, size: 0.02 } },
    { type: "glitch-overlay", config: { intensity: 0.3, frequency: 0.5 } },
  ],
  hiphop: [
    { type: "waveform", config: { thickness: 3, fill: true, mirror: true } },
    { type: "bass-reactive-ring", config: { radius: 0.4, glow: true } },
    { type: "text-lyrics", config: { fontSize: 48, style: "bold" } },
  ],
  rock: [
    { type: "radial-equalizer", config: { bars: 64, gap: 2, roundness: 0.5 } },
    { type: "explosion-particles", config: { count: 1500, spread: 1.5 } },
    { type: "noise-overlay", config: { amount: 0.1 } },
  ],
  pop: [
    { type: "particle-field", config: { count: 1000, speed: 1, size: 0.015 } },
    { type: "floating-shapes", config: { shapes: ["circle", "square", "triangle"], count: 20 } },
    { type: "color-pulse", config: { speed: 1, intensity: 0.5 } },
  ],
  jazz: [
    { type: "smooth-waveform", config: { smoothing: 0.9, color: "gradient" } },
    { type: "floating-notes", config: { count: 30, size: 0.03 } },
    { type: "warm-glow", config: { radius: 0.8, intensity: 0.3 } },
  ],
  classical: [
    { type: "orchestral-spectrum", config: { segments: 256, smoothing: 0.95 } },
    { type: "swirl-particles", config: { count: 500, rotation: 0.5 } },
    { type: "soft-vignette", config: { darkness: 0.4 } },
  ],
  ambient: [
    { type: "flow-field", config: { resolution: 32, speed: 0.5 } },
    { type: "aurora-waves", config: { layers: 5, amplitude: 0.3 } },
    { type: "star-field", config: { count: 200, twinkle: true } },
  ],
  lofi: [
    { type: "grain-overlay", config: { amount: 0.15, speed: 0.5 } },
    { type: "vhs-lines", config: { intensity: 0.1, speed: 0.3 } },
    { type: "soft-waveform", config: { thickness: 2, opacity: 0.7 } },
  ],
};

// Audio mapping presets based on genre
const GENRE_MAPPINGS: Record<string, AiGeneratedPreset["audioMapping"]> = {
  edm: [
    { source: "bass", target: "particleSpeed", amount: 0.8, curve: "exponential" },
    { source: "mid", target: "rotation", amount: 0.5, curve: "linear" },
    { source: "treble", target: "glitchIntensity", amount: 0.6, curve: "step" },
  ],
  hiphop: [
    { source: "bass", target: "scale", amount: 0.7, curve: "exponential" },
    { source: "onset", target: "flash", amount: 1.0, curve: "step" },
    { source: "loudness", target: "bloomIntensity", amount: 0.4, curve: "linear" },
  ],
  rock: [
    { source: "bass", target: "explosionForce", amount: 0.9, curve: "exponential" },
    { source: "mid", target: "barHeight", amount: 0.6, curve: "linear" },
    { source: "treble", target: "particleCount", amount: 0.5, curve: "quadratic" },
  ],
  pop: [
    { source: "onset", target: "shapeSize", amount: 0.5, curve: "ease-out" },
    { source: "pitch", target: "hueShift", amount: 0.3, curve: "linear" },
    { source: "loudness", target: "brightness", amount: 0.4, curve: "linear" },
  ],
  jazz: [
    { source: "pitch", target: "waveAmplitude", amount: 0.6, curve: "linear" },
    { source: "onset", target: "noteAppearance", amount: 0.8, curve: "ease-in-out" },
    { source: "loudness", target: "glowIntensity", amount: 0.3, curve: "linear" },
  ],
  classical: [
    { source: "dynamics", target: "swirlSpeed", amount: 0.5, curve: "linear" },
    { source: "pitch", target: "colorTemp", amount: 0.4, curve: "linear" },
    { source: "onset", target: "starBrightness", amount: 0.6, curve: "ease-out" },
  ],
  ambient: [
    { source: "loudness", target: "flowSpeed", amount: 0.3, curve: "linear" },
    { source: "pitch", target: "auroraColor", amount: 0.5, curve: "linear" },
    { source: "spectral", target: "starCount", amount: 0.4, curve: "quadratic" },
  ],
  lofi: [
    { source: "bass", target: "grainIntensity", amount: 0.3, curve: "linear" },
    { source: "onset", target: "vhsGlitch", amount: 0.4, curve: "step" },
    { source: "loudness", target: "waveOpacity", amount: 0.5, curve: "linear" },
  ],
};

export async function generateAiPreset(
  request: AiPresetRequest
): Promise<AiGeneratedPreset> {
  // In production, this would call an AI API (OpenAI, Anthropic, etc.)
  // For now, we generate based on mood/genre combinations

  const moodConfig = MOOD_CONFIGS[request.mood] || MOOD_CONFIGS.energetic;
  const genreLayers = GENRE_LAYERS[request.genre] || GENRE_LAYERS.edm;
  const genreMappings = GENRE_MAPPINGS[request.genre] || GENRE_MAPPINGS.edm;

  // Adjust based on intensity
  const intensityMultiplier = request.intensity;

  // Adjust color palette based on preference
  let colorPalette = [...(moodConfig.colorPalette || [])];
  if (request.colorPreference === "monochrome") {
    colorPalette = colorPalette.map((_, i) => 
      `hsl(220, ${20 + i * 10}%, ${30 + i * 15}%)`
    );
  } else if (request.colorPreference === "rainbow") {
    colorPalette = ["#FF0000", "#FF8800", "#FFFF00", "#00FF00", "#0088FF", "#8800FF"];
  }

  // Adjust complexity
  const layerCount = request.complexity === "simple" ? 1 : 
                     request.complexity === "complex" ? genreLayers.length : 
                     Math.min(2, genreLayers.length);

  // Generate name based on mood and genre
  const nameAdjectives = ["Pulse", "Flow", "Wave", "Beat", "Rhythm", "Pulse", "Glow", "Drift"];
  const nameNouns = ["Dream", "Storm", "Vibe", "Force", "Energy", "Spirit", "Aura", "Spark"];
  const adjective = nameAdjectives[Math.floor(Math.random() * nameAdjectives.length)];
  const noun = nameNouns[Math.floor(Math.random() * nameNouns.length)];

  return {
    name: `${adjective} ${noun}`,
    description: `AI-generated ${request.mood} ${request.genre} preset with ${request.complexity} complexity`,
    visualizerMode: moodConfig.visualizerMode || "circular-spectrum",
    colorPalette,
    layerConfig: genreLayers.slice(0, layerCount).map(layer => ({
      ...layer,
      config: {
        ...layer.config,
        // Scale config values by intensity
        ...(layer.config.speed !== undefined && { speed: layer.config.speed * intensityMultiplier }),
        ...(layer.config.intensity !== undefined && { intensity: layer.config.intensity * intensityMultiplier }),
      },
    })),
    audioMapping: genreMappings.map(mapping => ({
      ...mapping,
      amount: mapping.amount * intensityMultiplier,
    })),
    postProcessing: {
      bloom: (moodConfig.postProcessing?.bloom || 0.8) * intensityMultiplier,
      vignette: moodConfig.postProcessing?.vignette || 0.3,
      noise: (moodConfig.postProcessing?.noise || 0.05) * intensityMultiplier,
      chromaticAberration: (moodConfig.postProcessing?.chromaticAberration || 0.002) * intensityMultiplier,
    },
  };
}

// Quick preset suggestions based on audio analysis
export function suggestPresetFromAudio(audioFeatures: {
  tempo: number;
  energy: number;
  danceability: number;
  valence: number;
}): AiPresetRequest {
  let mood: AiPresetRequest["mood"] = "energetic";
  let genre: AiPresetRequest["genre"] = "edm";

  // Determine mood from energy and valence
  if (audioFeatures.energy > 0.7 && audioFeatures.valence > 0.6) {
    mood = "energetic";
  } else if (audioFeatures.energy < 0.3) {
    mood = "calm";
  } else if (audioFeatures.energy > 0.7 && audioFeatures.valence < 0.4) {
    mood = "aggressive";
  } else if (audioFeatures.valence > 0.7) {
    mood = "uplifting";
  } else if (audioFeatures.energy < 0.5 && audioFeatures.valence < 0.4) {
    mood = "dark";
  } else {
    mood = "dreamy";
  }

  // Determine genre from tempo and danceability
  if (audioFeatures.tempo > 120 && audioFeatures.danceability > 0.7) {
    genre = "edm";
  } else if (audioFeatures.tempo > 90 && audioFeatures.tempo < 110) {
    genre = "hiphop";
  } else if (audioFeatures.tempo > 110 && audioFeatures.energy > 0.6) {
    genre = "rock";
  } else if (audioFeatures.danceability > 0.6) {
    genre = "pop";
  } else if (audioFeatures.tempo < 80) {
    genre = "ambient";
  } else {
    genre = "lofi";
  }

  return {
    mood,
    genre,
    intensity: audioFeatures.energy,
    complexity: audioFeatures.energy > 0.7 ? "complex" : "moderate",
  };
}
