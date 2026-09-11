export class BPMDetector {
  private sampleRate: number;
  private bufferSize: number;
  private beats: number[] = [];

  constructor(sampleRate: number = 44100, bufferSize: number = 1024) {
    this.sampleRate = sampleRate;
    this.bufferSize = bufferSize;
  }

  detectBPM(audioBuffer: AudioBuffer): { bpm: number; confidence: number } {
    const channelData = audioBuffer.getChannelData(0);
    const beats = this.findBeats(channelData);

    if (beats.length < 2) {
      return { bpm: 0, confidence: 0 };
    }

    const intervals = this.calculateIntervals(beats);
    const bpm = this.intervalToBPM(intervals);
    const confidence = this.calculateConfidence(intervals);

    return { bpm: Math.round(bpm), confidence };
  }

  private findBeats(data: Float32Array): number[] {
    const beats: number[] = [];
    const windowSize = Math.floor(this.sampleRate * 0.02); // 20ms windows
    const hopSize = Math.floor(windowSize / 2);

    let prevEnergy = 0;

    for (let i = 0; i < data.length - windowSize; i += hopSize) {
      let energy = 0;
      for (let j = 0; j < windowSize; j++) {
        energy += data[i + j] * data[i + j];
      }
      energy /= windowSize;

      // Simple onset detection
      if (energy > prevEnergy * 1.5 && energy > 0.01) {
        const time = i / this.sampleRate;
        if (beats.length === 0 || time - beats[beats.length - 1] > 0.1) {
          beats.push(time);
        }
      }

      prevEnergy = energy;
    }

    return beats;
  }

  private calculateIntervals(beats: number[]): number[] {
    const intervals: number[] = [];
    for (let i = 1; i < beats.length; i++) {
      intervals.push(beats[i] - beats[i - 1]);
    }
    return intervals;
  }

  private intervalToBPM(intervals: number[]): number {
    if (intervals.length === 0) return 0;

    // Group intervals into histogram
    const histogram: Map<number, number> = new Map();
    const tolerance = 0.05; // 50ms tolerance

    for (const interval of intervals) {
      const bpm = 60 / interval;
      // Normalize to 60-180 BPM range
      const normalizedBPM = this.normalizeBPM(bpm);
      const key = Math.round(normalizedBPM / 2) * 2; // Round to nearest 2
      histogram.set(key, (histogram.get(key) || 0) + 1);
    }

    // Find the most common BPM
    let maxCount = 0;
    let dominantBPM = 0;

    for (const [bpm, count] of histogram) {
      if (count > maxCount) {
        maxCount = count;
        dominantBPM = bpm;
      }
    }

    return dominantBPM;
  }

  private normalizeBPM(bpm: number): number {
    // Normalize to 60-180 BPM range
    while (bpm < 60) bpm *= 2;
    while (bpm > 180) bpm /= 2;
    return bpm;
  }

  private calculateConfidence(intervals: number[]): number {
    if (intervals.length < 2) return 0;

    const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance =
      intervals.reduce((sum, interval) => {
        return sum + Math.pow(interval - mean, 2);
      }, 0) / intervals.length;

    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = stdDev / mean;

    // Lower variation = higher confidence
    return Math.max(0, Math.min(1, 1 - coefficientOfVariation));
  }

  reset(): void {
    this.beats = [];
  }
}
