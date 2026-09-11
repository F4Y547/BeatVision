export interface ExportConfig {
  format: "mp4" | "webm";
  width: number;
  height: number;
  fps: 24 | 30 | 60;
  quality: "low" | "medium" | "high";
  includeAudio: boolean;
  startOffset: number;
  endOffset: number;
}

export interface ExportProgress {
  phase: "encoding" | "muxing" | "finalizing";
  progress: number;
  frame: number;
  totalFrames: number;
}

export interface ExportResult {
  success: boolean;
  blob?: Blob;
  filename: string;
  error?: string;
}

export class ExportEngine {
  private ffmpeg: any = null;
  private loaded = false;

  async initialize(): Promise<void> {
    if (this.loaded) return;

    const { FFmpeg } = await import("@ffmpeg/ffmpeg");
    const { toBlobURL } = await import("@ffmpeg/util");

    this.ffmpeg = new FFmpeg();

    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";
    await this.ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        "application/wasm"
      ),
    });

    this.loaded = true;
  }

  async exportVideo(
    frames: ImageData[],
    audioBuffer: AudioBuffer | null,
    config: ExportConfig,
    onProgress?: (progress: ExportProgress) => void
  ): Promise<ExportResult> {
    if (!this.loaded || !this.ffmpeg) {
      return {
        success: false,
        filename: "",
        error: "Export engine not initialized",
      };
    }

    try {
      const totalFrames = frames.length;
      const filename = `output.${config.format}`;

      // Write frames as images
      for (let i = 0; i < totalFrames; i++) {
        const frameData = frames[i].data;
        const frameFilename = `frame${i.toString().padStart(6, "0")}.png`;

        await this.ffmpeg.writeFile(
          frameFilename,
          new Uint8Array(frameData)
        );

        onProgress?.({
          phase: "encoding",
          progress: (i / totalFrames) * 80,
          frame: i,
          totalFrames,
        });
      }

      // Create video from frames
      const ffmpegArgs = [
        "-framerate",
        config.fps.toString(),
        "-i",
        "frame%06d.png",
      ];

      if (audioBuffer && config.includeAudio) {
        // Write audio file
        const audioData = this.audioBufferToWav(audioBuffer);
        await this.ffmpeg.writeFile("audio.wav", new Uint8Array(audioData));

        ffmpegArgs.push("-i", "audio.wav", "-c:a", "aac", "-b:a", "192k");
      }

      ffmpegArgs.push(
        "-c:v",
        config.format === "mp4" ? "libx264" : "libvpx",
        "-pix_fmt",
        "yuv420p",
        filename
      );

      await this.ffmpeg.exec(ffmpegArgs);

      onProgress?.({
        phase: "finalizing",
        progress: 95,
        frame: totalFrames,
        totalFrames,
      });

      // Read output file
      const outputData = await this.ffmpeg.readFile(filename);
      const blob = new Blob([outputData], {
        type: config.format === "mp4" ? "video/mp4" : "video/webm",
      });

      // Clean up
      for (let i = 0; i < totalFrames; i++) {
        const frameFilename = `frame${i.toString().padStart(6, "0")}.png`;
        await this.ffmpeg.deleteFile(frameFilename);
      }
      await this.ffmpeg.deleteFile(filename);
      if (audioBuffer && config.includeAudio) {
        await this.ffmpeg.deleteFile("audio.wav");
      }

      onProgress?.({
        phase: "finalizing",
        progress: 100,
        frame: totalFrames,
        totalFrames,
      });

      return {
        success: true,
        blob,
        filename,
      };
    } catch (error) {
      return {
        success: false,
        filename: "",
        error: error instanceof Error ? error.message : "Export failed",
      };
    }
  }

  private audioBufferToWav(buffer: AudioBuffer): ArrayBuffer {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;

    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;

    const dataLength = buffer.length * blockAlign;
    const headerLength = 44;
    const totalLength = headerLength + dataLength;

    const arrayBuffer = new ArrayBuffer(totalLength);
    const view = new DataView(arrayBuffer);

    // WAV header
    this.writeString(view, 0, "RIFF");
    view.setUint32(4, totalLength - 8, true);
    this.writeString(view, 8, "WAVE");
    this.writeString(view, 12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    this.writeString(view, 36, "data");
    view.setUint32(40, dataLength, true);

    // Write audio data
    const offset = 44;
    for (let i = 0; i < buffer.length; i++) {
      for (let channel = 0; channel < numChannels; channel++) {
        const sample = buffer.getChannelData(channel)[i];
        const intSample = Math.max(
          -32768,
          Math.min(32767, Math.floor(sample * 32767))
        );
        view.setInt16(offset + (i * blockAlign + channel * bytesPerSample), intSample, true);
      }
    }

    return arrayBuffer;
  }

  private writeString(view: DataView, offset: number, string: string): void {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  destroy(): void {
    if (this.ffmpeg) {
      this.ffmpeg.terminate();
    }
  }
}
