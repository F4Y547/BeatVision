import type {
  AudioAnalysisResult,
  FrequencyBands,
  BeatMarker,
  AudioEngineConfig,
} from "./types";
import { DEFAULT_CONFIG } from "./types";

export class AudioAnalyzer {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private source: MediaElementAudioSourceNode | null = null;
  private config: AudioEngineConfig;
  private beatHistory: number[] = [];
  private lastBeatTime = 0;

  constructor(config: Partial<AudioEngineConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async initialize(audioElement: HTMLAudioElement): Promise<void> {
    this.audioContext = new AudioContext();
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = this.config.fftSize;
    this.analyser.smoothingTimeConstant = this.config.smoothing;
    this.analyser.minDecibels = this.config.minDecibels;
    this.analyser.maxDecibels = this.config.maxDecibels;

    this.source = this.audioContext.createMediaElementSource(audioElement);
    this.source.connect(this.analyser);
    this.analyser.connect(this.audioContext.destination);
  }

  getFrequencyData(): Float32Array {
    if (!this.analyser) return new Float32Array(0);
    const data = new Float32Array(this.analyser.frequencyBinCount);
    this.analyser.getFloatFrequencyData(data);
    return data;
  }

  getTimeDomainData(): Float32Array {
    if (!this.analyser) return new Float32Array(0);
    const data = new Float32Array(this.analyser.frequencyBinCount);
    this.analyser.getFloatTimeDomainData(data);
    return data;
  }

  getFrequencyBands(): FrequencyBands {
    const data = this.getFrequencyData();
    if (data.length === 0) {
      return { bass: 0, lowMid: 0, mid: 0, highMid: 0, treble: 0 };
    }

    const nyquist = (this.audioContext?.sampleRate || 44100) / 2;
    const binSize = nyquist / data.length;

    const getBandEnergy = (low: number, high: number): number => {
      const lowBin = Math.floor(low / binSize);
      const highBin = Math.min(Math.ceil(high / binSize), data.length - 1);
      let sum = 0;
      let count = 0;
      for (let i = lowBin; i <= highBin; i++) {
        // Convert from dB to linear
        const linear = Math.pow(10, data[i] / 20);
        sum += linear;
        count++;
      }
      return count > 0 ? sum / count : 0;
    };

    return {
      bass: getBandEnergy(20, 250),
      lowMid: getBandEnergy(250, 500),
      mid: getBandEnergy(500, 2000),
      highMid: getBandEnergy(2000, 4000),
      treble: getBandEnergy(4000, 20000),
    };
  }

  getRMS(): number {
    const data = this.getTimeDomainData();
    if (data.length === 0) return 0;

    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum += data[i] * data[i];
    }
    return Math.sqrt(sum / data.length);
  }

  getPeak(): number {
    const data = this.getTimeDomainData();
    if (data.length === 0) return 0;

    let peak = 0;
    for (let i = 0; i < data.length; i++) {
      const abs = Math.abs(data[i]);
      if (abs > peak) peak = abs;
    }
    return peak;
  }

  getSpectralCentroid(): number {
    const data = this.getFrequencyData();
    if (data.length === 0) return 0;

    const nyquist = (this.audioContext?.sampleRate || 44100) / 2;
    const binSize = nyquist / data.length;

    let weightedSum = 0;
    let magnitudeSum = 0;

    for (let i = 0; i < data.length; i++) {
      const frequency = i * binSize;
      const magnitude = Math.pow(10, data[i] / 20);
      weightedSum += frequency * magnitude;
      magnitudeSum += magnitude;
    }

    return magnitudeSum > 0 ? weightedSum / magnitudeSum : 0;
  }

  detectBeat(): boolean {
    const bands = this.getFrequencyBands();
    const energy = bands.bass * 0.6 + bands.lowMid * 0.3 + bands.mid * 0.1;

    this.beatHistory.push(energy);
    if (this.beatHistory.length > 43) {
      this.beatHistory.shift();
    }

    if (this.beatHistory.length < 10) return false;

    const avg =
      this.beatHistory.reduce((a, b) => a + b, 0) / this.beatHistory.length;
    const threshold = avg * 1.3;

    const now = performance.now() / 1000;
    if (energy > threshold && now - this.lastBeatTime > 0.15) {
      this.lastBeatTime = now;
      return true;
    }

    return false;
  }

  destroy(): void {
    if (this.source) {
      this.source.disconnect();
    }
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}
