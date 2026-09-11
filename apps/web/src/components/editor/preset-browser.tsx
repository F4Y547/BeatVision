"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BUILT_IN_PRESETS, type PresetConfig } from "@/lib/presets";

interface PresetBrowserProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (preset: PresetConfig) => void;
  currentPresetId?: string;
}

export function PresetBrowser({
  isOpen,
  onClose,
  onSelectPreset,
  currentPresetId,
}: PresetBrowserProps) {
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  if (!isOpen) return null;

  const filteredPresets = BUILT_IN_PRESETS.filter((preset) => {
    if (search) {
      return (
        preset.name.toLowerCase().includes(search.toLowerCase()) ||
        preset.description.toLowerCase().includes(search.toLowerCase())
      );
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl max-h-[80vh] bg-surface-1 rounded-2xl border border-white/10 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <h2 className="text-lg font-semibold">Presets</h2>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-surface-3 transition-colors"
          >
            <svg
              className="w-5 h-5"
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

        {/* Search */}
        <div className="p-4 border-b border-white/5">
          <input
            type="text"
            placeholder="Search presets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-2 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-beatvision-500"
          />
        </div>

        {/* Preset Grid */}
        <div className="flex-1 overflow-auto p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredPresets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => {
                  onSelectPreset(preset);
                  onClose();
                }}
                className={`group relative p-4 rounded-xl border transition-all text-left ${
                  currentPresetId === preset.id
                    ? "bg-beatvision-600/20 border-beatvision-500"
                    : "bg-surface-2 border-white/5 hover:border-white/20"
                }`}
              >
                {/* Color Preview */}
                <div className="flex gap-1 mb-3">
                  {preset.colorScheme.slice(0, 3).map((color, i) => (
                    <div
                      key={i}
                      className="w-6 h-6 rounded-full border border-white/10"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>

                {/* Name & Description */}
                <h3 className="font-medium text-white group-hover:text-beatvision-400 transition-colors">
                  {preset.name}
                </h3>
                <p className="text-xs text-zinc-500 mt-1 line-clamp-2">
                  {preset.description}
                </p>

                {/* Mode Badge */}
                <div className="mt-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-3 text-zinc-400">
                    {preset.mode.replace(/-/g, " ")}
                  </span>
                </div>

                {/* Selected Indicator */}
                {currentPresetId === preset.id && (
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-beatvision-500" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 flex items-center justify-between">
          <p className="text-sm text-zinc-500">
            {filteredPresets.length} presets available
          </p>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
