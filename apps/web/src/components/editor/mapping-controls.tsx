"use client";

import { useState } from "react";

export interface AudioMapping {
  id: string;
  source: "bass" | "lowMid" | "mid" | "highMid" | "treble" | "volume" | "beat" | "centroid";
  target: string;
  min: number;
  max: number;
  smoothing: number;
  curve: "linear" | "exponential" | "logarithmic";
  enabled: boolean;
}

interface MappingControlsProps {
  mappings: AudioMapping[];
  onUpdateMapping: (id: string, updates: Partial<AudioMapping>) => void;
  onAddMapping: () => void;
  onRemoveMapping: (id: string) => void;
}

const sourceOptions: { value: AudioMapping["source"]; label: string }[] = [
  { value: "bass", label: "Bass (20-250Hz)" },
  { value: "lowMid", label: "Low Mid (250-500Hz)" },
  { value: "mid", label: "Mid (500-2000Hz)" },
  { value: "highMid", label: "High Mid (2000-4000Hz)" },
  { value: "treble", label: "Treble (4000-20000Hz)" },
  { value: "volume", label: "Overall Volume" },
  { value: "beat", label: "Beat Detection" },
  { value: "centroid", label: "Spectral Centroid" },
];

const targetOptions = [
  "scale",
  "opacity",
  "rotation",
  "glow",
  "intensity",
  "speed",
  "radius",
  "thickness",
  "offset",
  "color",
];

export function MappingControls({
  mappings,
  onUpdateMapping,
  onAddMapping,
  onRemoveMapping,
}: MappingControlsProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-300">Audio Mapping</h3>
        <button
          onClick={onAddMapping}
          className="text-xs text-beatvision-400 hover:text-beatvision-300"
        >
          + Add
        </button>
      </div>

      {mappings.length === 0 && (
        <div className="text-center py-4 text-zinc-500 text-sm">
          No mappings configured
        </div>
      )}

      {mappings.map((mapping) => (
        <div
          key={mapping.id}
          className={`bg-surface-2 rounded-lg border transition-colors ${
            expandedId === mapping.id
              ? "border-beatvision-500/50"
              : "border-white/5"
          }`}
        >
          {/* Mapping Header */}
          <div
            className="flex items-center gap-2 px-3 py-2 cursor-pointer"
            onClick={() =>
              setExpandedId(expandedId === mapping.id ? null : mapping.id)
            }
          >
            <div
              className={`w-2 h-2 rounded-full ${
                mapping.enabled ? "bg-green-500" : "bg-zinc-500"
              }`}
            />
            <span className="flex-1 text-sm truncate">
              {mapping.source} → {mapping.target}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUpdateMapping(mapping.id, { enabled: !mapping.enabled });
              }}
              className={`text-xs px-2 py-0.5 rounded ${
                mapping.enabled
                  ? "bg-beatvision-600/20 text-beatvision-400"
                  : "bg-surface-3 text-zinc-500"
              }`}
            >
              {mapping.enabled ? "On" : "Off"}
            </button>
            <svg
              className={`w-4 h-4 text-zinc-400 transition-transform ${
                expandedId === mapping.id ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>

          {/* Expanded Controls */}
          {expandedId === mapping.id && (
            <div className="px-3 pb-3 space-y-3 border-t border-white/5 pt-3">
              {/* Source */}
              <div className="space-y-1">
                <label className="text-xs text-zinc-400">Source</label>
                <select
                  value={mapping.source}
                  onChange={(e) =>
                    onUpdateMapping(mapping.id, {
                      source: e.target.value as AudioMapping["source"],
                    })
                  }
                  className="w-full bg-surface-3 border border-white/10 rounded px-2 py-1.5 text-sm text-white"
                >
                  {sourceOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Target */}
              <div className="space-y-1">
                <label className="text-xs text-zinc-400">Target</label>
                <select
                  value={mapping.target}
                  onChange={(e) =>
                    onUpdateMapping(mapping.id, { target: e.target.value })
                  }
                  className="w-full bg-surface-3 border border-white/10 rounded px-2 py-1.5 text-sm text-white"
                >
                  {targetOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Min/Max */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs text-zinc-400">
                    Min: {mapping.min.toFixed(2)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.01"
                    value={mapping.min}
                    onChange={(e) =>
                      onUpdateMapping(mapping.id, {
                        min: parseFloat(e.target.value),
                      })
                    }
                    className="w-full accent-beatvision-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-zinc-400">
                    Max: {mapping.max.toFixed(2)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="3"
                    step="0.01"
                    value={mapping.max}
                    onChange={(e) =>
                      onUpdateMapping(mapping.id, {
                        max: parseFloat(e.target.value),
                      })
                    }
                    className="w-full accent-beatvision-500"
                  />
                </div>
              </div>

              {/* Smoothing */}
              <div className="space-y-1">
                <label className="text-xs text-zinc-400">
                  Smoothing: {mapping.smoothing.toFixed(2)}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={mapping.smoothing}
                  onChange={(e) =>
                    onUpdateMapping(mapping.id, {
                      smoothing: parseFloat(e.target.value),
                    })
                  }
                  className="w-full accent-beatvision-500"
                />
              </div>

              {/* Curve */}
              <div className="space-y-1">
                <label className="text-xs text-zinc-400">Curve</label>
                <div className="flex gap-1">
                  {(["linear", "exponential", "logarithmic"] as const).map(
                    (curve) => (
                      <button
                        key={curve}
                        onClick={() =>
                          onUpdateMapping(mapping.id, { curve })
                        }
                        className={`flex-1 py-1 text-xs rounded ${
                          mapping.curve === curve
                            ? "bg-beatvision-600 text-white"
                            : "bg-surface-3 text-zinc-400 hover:text-white"
                        }`}
                      >
                        {curve.charAt(0).toUpperCase() + curve.slice(1)}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Delete */}
              <button
                onClick={() => onRemoveMapping(mapping.id)}
                className="w-full py-1.5 text-xs text-red-400 hover:bg-red-500/10 rounded transition-colors"
              >
                Remove Mapping
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
