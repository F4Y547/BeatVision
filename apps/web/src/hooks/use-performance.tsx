"use client";

import React from "react";
import { useEffect, useRef, useState } from "react";

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memoryUsed: number;
  memoryTotal: number;
  renderTime: number;
  audioLatency: number;
}

export function usePerformanceMonitor(): PerformanceMetrics {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    frameTime: 16.67,
    memoryUsed: 0,
    memoryTotal: 0,
    renderTime: 0,
    audioLatency: 0,
  });

  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());

  useEffect(() => {
    let animationId: number;

    const measure = () => {
      frameCount.current++;
      const now = performance.now();
      const delta = now - lastTime.current;

      // Update FPS every second
      if (delta >= 1000) {
        const fps = Math.round((frameCount.current * 1000) / delta);
        const frameTime = delta / frameCount.current;

        // Get memory info if available
        let memoryUsed = 0;
        let memoryTotal = 0;
        if ("memory" in performance) {
          const memory = (performance as any).memory;
          memoryUsed = Math.round(memory.usedJSHeapSize / 1024 / 1024);
          memoryTotal = Math.round(memory.totalJSHeapSize / 1024 / 1024);
        }

        // Get render time from PerformanceObserver
        const entries = performance.getEntriesByType("render");
        const renderTime =
          entries.length > 0
            ? entries[entries.length - 1].duration
            : 0;

        setMetrics({
          fps,
          frameTime: Math.round(frameTime * 100) / 100,
          memoryUsed,
          memoryTotal,
          renderTime: Math.round(renderTime * 100) / 100,
          audioLatency: 0,
        });

        frameCount.current = 0;
        lastTime.current = now;
      }

      animationId = requestAnimationFrame(measure);
    };

    animationId = requestAnimationFrame(measure);

    return () => cancelAnimationFrame(animationId);
  }, []);

  return metrics;
}

// Performance overlay component
export function PerformanceOverlay() {
  const metrics = usePerformanceMonitor();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Toggle with Ctrl+Shift+P
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "P") {
        setIsVisible((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!isVisible) return null;

  const fpsColor =
    metrics.fps >= 55 ? "text-green-400" : metrics.fps >= 30 ? "text-yellow-400" : "text-red-400";

  return (
    <div className="fixed top-4 right-4 z-50 bg-black/80 backdrop-blur-sm rounded-lg p-3 font-mono text-xs space-y-1">
      <div className="flex items-center justify-between gap-4">
        <span className="text-zinc-500">FPS</span>
        <span className={fpsColor}>{metrics.fps}</span>
      </div>
      <div className="flex items-center justify-between gap-4">
        <span className="text-zinc-500">Frame</span>
        <span className="text-zinc-300">{metrics.frameTime}ms</span>
      </div>
      {metrics.memoryTotal > 0 && (
        <>
          <div className="flex items-center justify-between gap-4">
            <span className="text-zinc-500">Memory</span>
            <span className="text-zinc-300">
              {metrics.memoryUsed}/{metrics.memoryTotal}MB
            </span>
          </div>
          <div className="w-24 h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-beatvision-500"
              style={{
                width: `${(metrics.memoryUsed / metrics.memoryTotal) * 100}%`,
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}
