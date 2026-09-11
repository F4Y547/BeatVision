export interface BeatDetectionResult {
  beats: BeatInfo[];
  tempo: number;
  timeSignature: number;
  bars: BarInfo[];
  segments: SegmentInfo[];
  energy: EnergyProfile;
}

export interface BeatInfo {
  time: number;
  strength: number;
  isDownbeat: boolean;
}

export interface BarInfo {
  startTime: number;
  endTime: number;
  beats: number;
}

export interface SegmentInfo {
  startTime: number;
  endTime: number;
  label: string;
  confidence: number;
  energy: number;
}

export interface EnergyProfile {
  overall: number;
  bass: number;
  mid: number;
  treble: number;
  onset: number;
  loudness: number;
  dynamicRange: number;
}

export interface SpectralFeatures {
  centroid: number;
  bandwidth: number;
  rolloff: number;
  flatness: number;
  contrast: number[];
}

// Enhanced beat detection using Web Audio API
export class BeatDetector {
  private audioContext: AudioContext;
  private analyser: AnalyserNode;
  private buffer: AudioBuffer | null = null;
  private sampleRate: number = 44100;

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
    this.analyser = audioContext.createAnalyser();
    this.analyser.fftSize = 2048;
  }

  async loadAudio(url: string): Promise<void> {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    this.buffer = await this.audioContext.decodeAudioData(arrayBuffer);
    this.sampleRate = this.buffer.sampleRate;
  }

  async detectFromBuffer(buffer: AudioBuffer): Promise<BeatDetectionResult> {
    this.buffer = buffer;
    this.sampleRate = buffer.sampleRate;

    const audioData = buffer.getChannelData(0);
    
    // Step 1: Compute energy envelope
    const energyEnvelope = this.computeEnergyEnvelope(audioData);
    
    // Step 2: Detect onsets
    const onsets = this.detectOnsets(energyEnvelope);
    
    // Step 3: Estimate tempo
    const tempo = this.estimateTempo(onsets);
    
    // Step 4: Refine beat positions
    const beats = this.refineBeats(onsets, tempo);
    
    // Step 5: Detect bars
    const bars = this.detectBars(beats, tempo);
    
    // Step 6: Segment analysis
    const segments = this.detectSegments(audioData, energyEnvelope);
    
    // Step 7: Energy profile
    const energy = this.computeEnergyProfile(audioData);

    return {
      beats,
      tempo,
      timeSignature: 4,
      bars,
      segments,
      energy,
    };
  }

  private computeEnergyEnvelope(audioData: Float32Array): number[] {
    const windowSize = 1024;
    const hopSize = 512;
    const envelope: number[] = [];

    for (let i = 0; i < audioData.length - windowSize; i += hopSize) {
      let energy = 0;
      for (let j = 0; j < windowSize; j++) {
        energy += audioData[i + j] ** 2;
      }
      envelope.push(Math.sqrt(energy / windowSize));
    }

    return envelope;
  }

  private detectOnsets(energyEnvelope: number[]): number[] {
    const onsets: number[] = [];
    const threshold = this.computeAdaptiveThreshold(energyEnvelope);
    const windowSize = 10;
    const hopSize = 512;
    const sampleRate = this.sampleRate;

    // Spectral flux onset detection
    for (let i = windowSize; i < energyEnvelope.length; i++) {
      let flux = 0;
      for (let j = 0; j < windowSize; j++) {
        const diff = energyEnvelope[i - j] - energyEnvelope[i - j - 1];
        if (diff > 0) flux += diff;
      }

      if (flux > threshold && energyEnvelope[i] > energyEnvelope[i - 1]) {
        const time = (i * hopSize) / sampleRate;
        if (onsets.length === 0 || time - onsets[onsets.length - 1] > 0.1) {
          onsets.push(time);
        }
      }
    }

    return onsets;
  }

  private computeAdaptiveThreshold(energyEnvelope: number[]): number {
    const windowSize = 10;
    const multiplier = 1.5;
    const thresholds: number[] = [];

    for (let i = 0; i < energyEnvelope.length; i++) {
      let sum = 0;
      let count = 0;
      for (
        let j = Math.max(0, i - windowSize);
        j < i;
        j++
      ) {
        sum += energyEnvelope[j];
        count++;
      }
      thresholds.push((sum / count) * multiplier);
    }

    return thresholds.reduce((a, b) => a + b, 0) / thresholds.length;
  }

  private estimateTempo(onsets: number[]): number {
    if (onsets.length < 2) return 120;

    // Compute inter-onset intervals
    const intervals: number[] = [];
    for (let i = 1; i < onsets.length; i++) {
      intervals.push(onsets[i] - onsets[i - 1]);
    }

    // Build histogram
    const histogram: Map<number, number> = new Map();
    for (const interval of intervals) {
      // Map to BPM range 60-200
      const bpm = Math.round(60 / interval);
      if (bpm >= 60 && bpm <= 200) {
        histogram.set(bpm, (histogram.get(bpm) || 0) + 1);
      }
    }

    // Find peak
    let maxCount = 0;
    let estimatedBpm = 120;
    histogram.forEach((count, bpm) => {
      if (count > maxCount) {
        maxCount = count;
        estimatedBpm = bpm;
      }
    });

    return estimatedBpm;
  }

  private refineBeats(
    onsets: number[],
    tempo: number
  ): BeatInfo[] {
    const beatInterval = 60 / tempo;
    const beats: BeatInfo[] = [];

    // Quantize onsets to beat grid
    for (const onset of onsets) {
      const beatPosition = Math.round(onset / beatInterval);
      const beatTime = beatPosition * beatInterval;
      
      beats.push({
        time: beatTime,
        strength: 0.5 + Math.random() * 0.5, // Simplified
        isDownbeat: beatPosition % 4 === 0,
      });
    }

    return beats;
  }

  private detectBars(
    beats: BeatInfo[],
    tempo: number
  ): BarInfo[] {
    const beatsPerBar = 4;
    const bars: BarInfo[] = [];
    let currentBar: BeatInfo[] = [];

    for (const beat of beats) {
      currentBar.push(beat);
      if (currentBar.length >= beatsPerBar) {
        bars.push({
          startTime: currentBar[0].time,
          endTime: currentBar[currentBar.length - 1].time,
          beats: currentBar.length,
        });
        currentBar = [];
      }
    }

    return bars;
  }

  private detectSegments(
    audioData: Float32Array,
    energyEnvelope: number[]
  ): SegmentInfo[] {
    const segments: SegmentInfo[] = [];
    const segmentLength = 30; // seconds
    const sampleRate = this.sampleRate;
    const duration = audioData.length / sampleRate;

    for (let start = 0; start < duration; start += segmentLength) {
      const end = Math.min(start + segmentLength, duration);
      
      // Compute average energy for this segment
      const startSample = Math.floor(start * sampleRate / 512);
      const endSample = Math.floor(end * sampleRate / 512);
      let segmentEnergy = 0;
      let count = 0;
      for (let i = startSample; i < Math.min(endSample, energyEnvelope.length); i++) {
        segmentEnergy += energyEnvelope[i];
        count++;
      }
      segmentEnergy /= count || 1;

      // Simple segment labeling based on energy
      let label = "verse";
      let confidence = 0.7;
      if (segmentEnergy > 0.7) {
        label = "chorus";
        confidence = 0.8;
      } else if (segmentEnergy < 0.3) {
        label = "intro";
        confidence = 0.6;
      }

      segments.push({
        startTime: start,
        endTime: end,
        label,
        confidence,
        energy: segmentEnergy,
      });
    }

    return segments;
  }

  private computeEnergyProfile(audioData: Float32Array): EnergyProfile {
    // Compute frequency bands
    const bufferSize = 2048;
    const buffer = new Float32Array(bufferSize);
    
    // Simple energy computation
    let totalEnergy = 0;
    let bassEnergy = 0;
    let midEnergy = 0;
    let trebleEnergy = 0;

    for (let i = 0; i < audioData.length; i++) {
      const sample = audioData[i];
      totalEnergy += sample * sample;
      
      // Frequency band simulation (simplified)
      const freq = (i % bufferSize) * (this.sampleRate / bufferSize);
      if (freq < 250) bassEnergy += sample * sample;
      else if (freq < 4000) midEnergy += sample * sample;
      else trebleEnergy += sample * sample;
    }

    const totalSamples = audioData.length;
    totalEnergy = Math.sqrt(totalEnergy / totalSamples);
    bassEnergy = Math.sqrt(bassEnergy / totalSamples);
    midEnergy = Math.sqrt(midEnergy / totalSamples);
    trebleEnergy = Math.sqrt(trebleEnergy / totalSamples);

    return {
      overall: totalEnergy,
      bass: bassEnergy,
      mid: midEnergy,
      treble: trebleEnergy,
      onset: bassEnergy * 0.8 + midEnergy * 0.2,
      loudness: totalEnergy * 20,
      dynamicRange: Math.abs(trebleEnergy - bassEnergy),
    };
  }
}

// AI-powered segment classification (simulated ML)
export async function classifySegment(
  audioData: Float32Array,
  sampleRate: number
): Promise<{ label: string; confidence: number }> {
  // In production, this would use a trained model (TensorFlow.js)
  // For now, we simulate classification based on audio features

  let energy = 0;
  for (let i = 0; i < audioData.length; i++) {
    energy += audioData[i] ** 2;
  }
  energy = Math.sqrt(energy / audioData.length);

  // Simple heuristic classification
  if (energy > 0.8) {
    return { label: "drop", confidence: 0.85 };
  } else if (energy > 0.5) {
    return { label: "buildup", confidence: 0.75 };
  } else if (energy > 0.3) {
    return { label: "verse", confidence: 0.7 };
  } else {
    return { label: "breakdown", confidence: 0.65 };
  }
}

// Predict optimal visualizer settings based on audio analysis
export function predictVisualizerSettings(
  beatResult: BeatDetectionResult
): {
  sensitivity: number;
  smoothing: number;
  bloomIntensity: number;
  particleCount: number;
  colorScheme: string;
} {
  const { tempo, energy } = beatResult;

  // High tempo + high energy = aggressive visuals
  if (tempo > 130 && energy.overall > 0.7) {
    return {
      sensitivity: 1.2,
      smoothing: 0.6,
      bloomIntensity: 1.5,
      particleCount: 2000,
      colorScheme: "neon",
    };
  }

  // Low tempo + low energy = calm visuals
  if (tempo < 90 && energy.overall < 0.4) {
    return {
      sensitivity: 0.8,
      smoothing: 0.9,
      bloomIntensity: 0.6,
      particleCount: 500,
      colorScheme: "pastel",
    };
  }

  // Medium tempo = balanced
  return {
    sensitivity: 1.0,
    smoothing: 0.75,
    bloomIntensity: 1.0,
    particleCount: 1000,
    colorScheme: "vibrant",
  };
}
