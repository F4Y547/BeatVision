export interface FrameCaptureOptions {
  width: number;
  height: number;
  fps: number;
  quality: number;
}

export interface CapturedFrame {
  index: number;
  timestamp: number;
  imageData: ImageData;
}

export class FrameCapturer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null = null;
  private options: FrameCaptureOptions;

  constructor(options: FrameCaptureOptions) {
    this.options = options;
    this.canvas = document.createElement("canvas");
    this.canvas.width = options.width;
    this.canvas.height = options.height;
    this.ctx = this.canvas.getContext("2d");
  }

  captureFrame(sourceCanvas: HTMLCanvasElement, timestamp: number, index: number): CapturedFrame | null {
    if (!this.ctx) return null;

    // Draw source canvas scaled to target size
    this.ctx.drawImage(sourceCanvas, 0, 0, this.options.width, this.options.height);

    // Get image data
    const imageData = this.ctx.getImageData(0, 0, this.options.width, this.options.height);

    return {
      index,
      timestamp,
      imageData,
    };
  }

  captureFromThreeRenderer(renderer: any, timestamp: number, index: number): CapturedFrame | null {
    if (!renderer || !this.ctx) return null;

    // Read pixels from Three.js renderer
    const gl = renderer.getContext();
    if (!gl) return null;

    const width = gl.drawingBufferWidth;
    const height = gl.drawingBufferHeight;

    this.canvas.width = width;
    this.canvas.height = height;

    // Read pixels
    const pixels = new Uint8Array(width * height * 4);
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

    // Convert to ImageData (flip vertically since WebGL reads bottom-up)
    const imageData = this.ctx.createImageData(width, height);
    for (let y = 0; y < height; y++) {
      const srcRow = (height - y - 1) * width * 4;
      const dstRow = y * width * 4;
      for (let x = 0; x < width * 4; x++) {
        imageData.data[dstRow + x] = pixels[srcRow + x];
      }
    }

    return {
      index,
      timestamp,
      imageData,
    };
  }

  frameToBlob(frame: CapturedFrame, format: string = "image/png", quality: number = 0.92): Promise<Blob | null> {
    return new Promise((resolve) => {
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = frame.imageData.width;
      tempCanvas.height = frame.imageData.height;
      const tempCtx = tempCanvas.getContext("2d");
      if (!tempCtx) {
        resolve(null);
        return;
      }

      tempCtx.putImageData(frame.imageData, 0, 0);
      tempCanvas.toBlob((blob) => resolve(blob), format, quality);
    });
  }

  frameToDataURL(frame: CapturedFrame, format: string = "image/png", quality: number = 0.92): string {
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = frame.imageData.width;
    tempCanvas.height = frame.imageData.height;
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return "";

    tempCtx.putImageData(frame.imageData, 0, 0);
    return tempCanvas.toDataURL(format, quality);
  }

  async frameToPngBytes(frame: CapturedFrame): Promise<Uint8Array> {
    const blob = await this.frameToBlob(frame, "image/png");
    if (!blob) return new Uint8Array();

    const buffer = await blob.arrayBuffer();
    return new Uint8Array(buffer);
  }

  updateOptions(options: Partial<FrameCaptureOptions>): void {
    this.options = { ...this.options, ...options };
    this.canvas.width = this.options.width;
    this.canvas.height = this.options.height;
  }

  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }
}
