"use client";

import { useRef, useEffect, useCallback, useState } from "react";

interface TimelineProps {
  duration: number;
  currentTime: number;
  isPlaying: boolean;
  audioData?: Float32Array | null;
  beatMarkers?: { time: number; strength: number }[];
  onSeek: (time: number) => void;
  onLoopChange?: (start: number, end: number | null) => void;
}

export function Timeline({
  duration,
  currentTime,
  isPlaying,
  audioData,
  beatMarkers = [],
  onSeek,
  onLoopChange,
}: TimelineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [loopStart, setLoopStart] = useState<number | null>(null);
  const [loopEnd, setLoopEnd] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const drawTimeline = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = container.clientWidth;
    const height = container.clientHeight;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    // Clear
    ctx.fillStyle = "#1a1a24";
    ctx.fillRect(0, 0, width, height);

    // Draw waveform if audio data available
    if (audioData && audioData.length > 0) {
      drawWaveform(ctx, audioData, width, height);
    } else {
      drawPlaceholderWaveform(ctx, width, height);
    }

    // Draw beat markers
    beatMarkers.forEach((marker) => {
      const x = (marker.time / duration) * width;
      ctx.strokeStyle = `rgba(92, 124, 250, ${0.3 + marker.strength * 0.7})`;
      ctx.lineWidth = marker.strength > 0.7 ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    });

    // Draw loop region
    if (loopStart !== null && loopEnd !== null) {
      const startX = (loopStart / duration) * width;
      const endX = (loopEnd / duration) * width;

      ctx.fillStyle = "rgba(92, 124, 250, 0.1)";
      ctx.fillRect(startX, 0, endX - startX, height);

      ctx.strokeStyle = "#5c7cfa";
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(startX, 0);
      ctx.lineTo(startX, height);
      ctx.moveTo(endX, 0);
      ctx.lineTo(endX, height);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw playhead
    const playheadX = (currentTime / duration) * width;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(playheadX, 0);
    ctx.lineTo(playheadX, height);
    ctx.stroke();

    // Playhead handle
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.moveTo(playheadX - 6, 0);
    ctx.lineTo(playheadX + 6, 0);
    ctx.lineTo(playheadX, 8);
    ctx.closePath();
    ctx.fill();
  }, [
    duration,
    currentTime,
    audioData,
    beatMarkers,
    loopStart,
    loopEnd,
    zoom,
  ]);

  const drawWaveform = (
    ctx: CanvasRenderingContext2D,
    data: Float32Array,
    width: number,
    height: number
  ) => {
    const barWidth = Math.max(1, (width / data.length) * 2);
    const gap = 1;
    const centerY = height / 2;

    for (let i = 0; i < data.length; i++) {
      const x = (i / data.length) * width;
      const value = Math.abs(data[i]);
      const barHeight = value * height * 0.8;

      // Gradient color based on position
      const hue = (i / data.length) * 60 + 220; // Blue to purple
      ctx.fillStyle = `hsla(${hue}, 70%, 60%, 0.8)`;

      // Draw bar up and down from center
      ctx.fillRect(x, centerY - barHeight / 2, barWidth, barHeight / 2);
      ctx.fillRect(x, centerY, barWidth, barHeight / 2);
    }
  };

  const drawPlaceholderWaveform = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    const centerY = height / 2;
    const barCount = Math.floor(width / 3);

    for (let i = 0; i < barCount; i++) {
      const x = (i / barCount) * width;
      const value = Math.sin(i * 0.1) * 0.3 + Math.random() * 0.2;
      const barHeight = value * height * 0.6;

      ctx.fillStyle = "rgba(92, 124, 250, 0.3)";
      ctx.fillRect(x, centerY - barHeight / 2, 2, barHeight / 2);
      ctx.fillRect(x, centerY, 2, barHeight / 2);
    }
  };

  useEffect(() => {
    drawTimeline();
  }, [drawTimeline]);

  useEffect(() => {
    const handleResize = () => drawTimeline();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [drawTimeline]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const time = (x / rect.width) * duration;

    onSeek(time);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.shiftKey) {
      // Set loop start
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const time = (x / rect.width) * duration;

      setLoopStart(time);
      setLoopEnd(null);
    } else {
      setIsDragging(true);
      handleClick(e);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    handleClick(e);
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      setIsDragging(false);
    }

    if (loopStart !== null && loopEnd === null) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const time = (x / rect.width) * duration;

      if (time > loopStart) {
        setLoopEnd(time);
        onLoopChange?.(loopStart, time);
      } else {
        setLoopStart(null);
      }
    }
  };

  const clearLoop = () => {
    setLoopStart(null);
    setLoopEnd(null);
    onLoopChange?.(0, null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Timeline Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
        <div className="flex items-center gap-4">
          <span className="text-xs font-medium text-zinc-400">Timeline</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
              className="p-1 text-zinc-400 hover:text-white rounded"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"
                />
              </svg>
            </button>
            <span className="text-xs text-zinc-500">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom(Math.min(4, zoom + 0.25))}
              className="p-1 text-zinc-400 hover:text-white rounded"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {loopStart !== null && loopEnd !== null && (
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <span>
                Loop: {formatTime(loopStart)} - {formatTime(loopEnd)}
              </span>
              <button
                onClick={clearLoop}
                className="p-1 text-zinc-400 hover:text-white"
              >
                <svg
                  className="w-3 h-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          )}
          <span className="text-xs text-zinc-500">
            Shift+click to set loop region
          </span>
        </div>
      </div>

      {/* Time Ruler */}
      <div className="h-6 px-4 border-b border-white/5 bg-surface-2 flex items-center">
        {Array.from({ length: Math.ceil(duration / 10) + 1 }).map((_, i) => {
          const time = i * 10;
          const x = (time / duration) * 100;
          return (
            <div
              key={i}
              className="absolute text-[10px] text-zinc-500"
              style={{ left: `calc(4rem + ${x}% * (100% - 8rem) / 100%)` }}
            >
              {formatTime(time)}
            </div>
          );
        })}
      </div>

      {/* Waveform Canvas */}
      <div ref={containerRef} className="flex-1 relative overflow-hidden">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 cursor-crosshair"
          onClick={handleClick}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => setIsDragging(false)}
        />
      </div>
    </div>
  );
}
