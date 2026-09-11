"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (config: ExportConfig) => void;
}

interface ExportConfig {
  format: "mp4" | "webm";
  width: number;
  height: number;
  fps: 24 | 30 | 60;
  quality: "low" | "medium" | "high";
  includeAudio: boolean;
}

const aspectRatios = [
  { label: "16:9 Landscape", width: 1920, height: 1080 },
  { label: "9:16 Portrait", width: 1080, height: 1920 },
  { label: "1:1 Square", width: 1080, height: 1080 },
  { label: "4:5 Social", width: 1080, height: 1350 },
];

export function ExportModal({ isOpen, onClose, onExport }: ExportModalProps) {
  const [config, setConfig] = useState<ExportConfig>({
    format: "mp4",
    width: 1920,
    height: 1080,
    fps: 30,
    quality: "high",
    includeAudio: true,
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Export Video</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Format */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Format</label>
            <div className="flex gap-2">
              {(["mp4", "webm"] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setConfig({ ...config, format: fmt })}
                  className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    config.format === fmt
                      ? "bg-beatvision-600 border-beatvision-500 text-white"
                      : "bg-surface-2 border-white/10 text-zinc-400 hover:text-white"
                  }`}
                >
                  {fmt.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Aspect Ratio */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">
              Aspect Ratio
            </label>
            <div className="grid grid-cols-2 gap-2">
              {aspectRatios.map((ar) => (
                <button
                  key={ar.label}
                  onClick={() =>
                    setConfig({ ...config, width: ar.width, height: ar.height })
                  }
                  className={`py-2 px-3 rounded-lg border text-sm transition-colors ${
                    config.width === ar.width && config.height === ar.height
                      ? "bg-beatvision-600 border-beatvision-500 text-white"
                      : "bg-surface-2 border-white/10 text-zinc-400 hover:text-white"
                  }`}
                >
                  {ar.label}
                </button>
              ))}
            </div>
          </div>

          {/* FPS */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">
              Frame Rate
            </label>
            <div className="flex gap-2">
              {([24, 30, 60] as const).map((fps) => (
                <button
                  key={fps}
                  onClick={() => setConfig({ ...config, fps })}
                  className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    config.fps === fps
                      ? "bg-beatvision-600 border-beatvision-500 text-white"
                      : "bg-surface-2 border-white/10 text-zinc-400 hover:text-white"
                  }`}
                >
                  {fps} FPS
                </button>
              ))}
            </div>
          </div>

          {/* Quality */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Quality</label>
            <div className="flex gap-2">
              {(["low", "medium", "high"] as const).map((q) => (
                <button
                  key={q}
                  onClick={() => setConfig({ ...config, quality: q })}
                  className={`flex-1 py-2 rounded-lg border text-sm font-medium capitalize transition-colors ${
                    config.quality === q
                      ? "bg-beatvision-600 border-beatvision-500 text-white"
                      : "bg-surface-2 border-white/10 text-zinc-400 hover:text-white"
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Audio */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-zinc-300">
              Include Audio
            </label>
            <button
              onClick={() =>
                setConfig({ ...config, includeAudio: !config.includeAudio })
              }
              className={`w-10 h-6 rounded-full transition-colors ${
                config.includeAudio ? "bg-beatvision-600" : "bg-surface-3"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  config.includeAudio ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button variant="secondary" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={() => onExport(config)}>
              Export
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
