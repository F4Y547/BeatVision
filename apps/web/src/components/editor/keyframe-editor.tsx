"use client";

import { useState, useCallback } from "react";

export interface Keyframe {
  id: string;
  time: number; // 0-1 normalized
  property: string;
  value: any;
  easing: "linear" | "ease-in" | "ease-out" | "ease-in-out" | "spring";
}

interface KeyframeEditorProps {
  keyframes: Keyframe[];
  onChange: (keyframes: Keyframe[]) => void;
  duration: number;
  selectedProperty: string;
}

const EASING_OPTIONS = [
  { value: "linear", label: "Linear" },
  { value: "ease-in", label: "Ease In" },
  { value: "ease-out", label: "Ease Out" },
  { value: "ease-in-out", label: "Ease In Out" },
  { value: "spring", label: "Spring" },
];

export function KeyframeEditor({
  keyframes,
  onChange,
  duration,
  selectedProperty,
}: KeyframeEditorProps) {
  const [selectedKeyframe, setSelectedKeyframe] = useState<string | null>(null);

  const propertyKeyframes = keyframes.filter(
    (k) => k.property === selectedProperty
  );

  const addKeyframe = useCallback(
    (time: number) => {
      const newKeyframe: Keyframe = {
        id: crypto.randomUUID(),
        time,
        property: selectedProperty,
        value: 0,
        easing: "ease-in-out",
      };
      onChange([...keyframes, newKeyframe]);
      setSelectedKeyframe(newKeyframe.id);
    },
    [keyframes, selectedProperty, onChange]
  );

  const updateKeyframe = useCallback(
    (id: string, updates: Partial<Keyframe>) => {
      onChange(
        keyframes.map((k) => (k.id === id ? { ...k, ...updates } : k))
      );
    },
    [keyframes, onChange]
  );

  const deleteKeyframe = useCallback(
    (id: string) => {
      onChange(keyframes.filter((k) => k.id !== id));
      setSelectedKeyframe(null);
    },
    [keyframes, onChange]
  );

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const time = Math.max(0, Math.min(1, x / rect.width));
    addKeyframe(time);
  };

  const formatTime = (normalizedTime: number) => {
    const seconds = Math.floor(normalizedTime * duration);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-surface-1 rounded-xl border border-white/5 p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-300">
          Keyframes - {selectedProperty}
        </h3>
        <span className="text-xs text-zinc-500">
          Click timeline to add keyframe
        </span>
      </div>

      {/* Timeline */}
      <div
        className="relative h-16 bg-surface-2 rounded-lg cursor-crosshair overflow-hidden"
        onClick={handleTimelineClick}
      >
        {/* Time markers */}
        <div className="absolute inset-x-0 top-0 h-4 flex items-end">
          {[0, 0.25, 0.5, 0.75, 1].map((t) => (
            <div
              key={t}
              className="absolute bottom-0 text-[10px] text-zinc-500"
              style={{ left: `${t * 100}%`, transform: "translateX(-50%)" }}
            >
              {formatTime(t)}
            </div>
          ))}
        </div>

        {/* Grid lines */}
        <div className="absolute inset-0">
          {[0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9].map((t) => (
            <div
              key={t}
              className="absolute top-4 bottom-0 w-px bg-white/5"
              style={{ left: `${t * 100}%` }}
            />
          ))}
        </div>

        {/* Keyframes */}
        {propertyKeyframes.map((kf) => (
          <div
            key={kf.id}
            className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full cursor-pointer transition-all ${
              selectedKeyframe === kf.id
                ? "bg-beatvision-400 ring-2 ring-beatvision-400/50 scale-125"
                : "bg-beatvision-500 hover:bg-beatvision-400"
            }`}
            style={{ left: `calc(${kf.time * 100}% - 8px)` }}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedKeyframe(kf.id);
            }}
          >
            <div
              className="absolute top-full mt-1 text-[10px] text-zinc-400 whitespace-nowrap"
              style={{ left: "50%", transform: "translateX(-50%)" }}
            >
              {formatTime(kf.time)}
            </div>
          </div>
        ))}

        {/* Connection line */}
        {propertyKeyframes.length > 1 && (
          <svg className="absolute inset-0 pointer-events-none">
            <line
              x1={`${propertyKeyframes[0].time * 100}%`}
              y1="50%"
              x2={`${propertyKeyframes[propertyKeyframes.length - 1].time * 100}%`}
              y2="50%"
              stroke="rgba(139, 92, 246, 0.3)"
              strokeWidth="2"
            />
          </svg>
        )}
      </div>

      {/* Keyframe Properties */}
      {selectedKeyframe && (
        <div className="space-y-3 pt-2 border-t border-white/5">
          {(() => {
            const kf = keyframes.find((k) => k.id === selectedKeyframe);
            if (!kf) return null;
            return (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-zinc-500">Time</label>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={kf.time}
                      onChange={(e) =>
                        updateKeyframe(kf.id, { time: parseFloat(e.target.value) })
                      }
                      className="w-full accent-beatvision-500"
                    />
                    <span className="text-xs text-zinc-400">
                      {formatTime(kf.time)}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-zinc-500">Value</label>
                    <input
                      type="number"
                      value={typeof kf.value === "number" ? kf.value : 0}
                      onChange={(e) =>
                        updateKeyframe(kf.id, {
                          value: parseFloat(e.target.value),
                        })
                      }
                      className="w-full bg-surface-2 border border-white/10 rounded px-2 py-1 text-sm text-white"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-zinc-500">Easing</label>
                  <div className="flex gap-1">
                    {EASING_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() =>
                          updateKeyframe(kf.id, {
                            easing: opt.value as Keyframe["easing"],
                          })
                        }
                        className={`flex-1 py-1 rounded text-xs font-medium transition-colors ${
                          kf.easing === opt.value
                            ? "bg-beatvision-600 text-white"
                            : "bg-surface-2 text-zinc-400 hover:text-white"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => deleteKeyframe(kf.id)}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Delete Keyframe
                  </button>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* Keyframe count */}
      <div className="text-xs text-zinc-500">
        {propertyKeyframes.length} keyframe{propertyKeyframes.length !== 1 ? "s" : ""}
      </div>
    </div>
  );
}

// Interpolation helpers
export function interpolateKeyframes(
  keyframes: Keyframe[],
  property: string,
  time: number
): any {
  const filtered = keyframes
    .filter((k) => k.property === property)
    .sort((a, b) => a.time - b.time);

  if (filtered.length === 0) return null;
  if (filtered.length === 1) return filtered[0].value;

  // Find surrounding keyframes
  let start = filtered[0];
  let end = filtered[filtered.length - 1];

  for (let i = 0; i < filtered.length - 1; i++) {
    if (time >= filtered[i].time && time <= filtered[i + 1].time) {
      start = filtered[i];
      end = filtered[i + 1];
      break;
    }
  }

  // Calculate interpolation progress
  const range = end.time - start.time;
  const progress = range === 0 ? 0 : (time - start.time) / range;

  // Apply easing
  const easedProgress = applyEasing(progress, end.easing);

  // Interpolate value
  if (typeof start.value === "number" && typeof end.value === "number") {
    return start.value + (end.value - start.value) * easedProgress;
  }

  return start.value;
}

function applyEasing(t: number, easing: Keyframe["easing"]): number {
  switch (easing) {
    case "linear":
      return t;
    case "ease-in":
      return t * t;
    case "ease-out":
      return t * (2 - t);
    case "ease-in-out":
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    case "spring":
      return 1 - Math.cos(t * Math.PI * 0.5);
    default:
      return t;
  }
}
