export interface AudioAnalysisResult {
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

export interface AudioEngineConfig {
  fftSize: number;
  smoothing: number;
  minDecibels: number;
  maxDecibels: number;
}

export const DEFAULT_CONFIG: AudioEngineConfig = {
  fftSize: 2048,
  smoothing: 0.8,
  minDecibels: -90,
  maxDecibels: -10,
};
