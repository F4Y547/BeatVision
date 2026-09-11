"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Shortcut {
  category: string;
  items: {
    keys: string[];
    description: string;
  }[];
}

const SHORTCUTS: Shortcut[] = [
  {
    category: "Playback",
    items: [
      { keys: ["Space"], description: "Play / Pause" },
      { keys: ["Left"], description: "Rewind 5 seconds" },
      { keys: ["Right"], description: "Forward 5 seconds" },
      { keys: ["Shift", "Left"], description: "Rewind 10 seconds" },
      { keys: ["Shift", "Right"], description: "Forward 10 seconds" },
      { keys: ["Home"], description: "Go to start" },
      { keys: ["End"], description: "Go to end" },
    ],
  },
  {
    category: "Editing",
    items: [
      { keys: ["Ctrl", "Z"], description: "Undo" },
      { keys: ["Ctrl", "Shift", "Z"], description: "Redo" },
      { keys: ["Ctrl", "C"], description: "Copy" },
      { keys: ["Ctrl", "V"], description: "Paste" },
      { keys: ["Ctrl", "D"], description: "Duplicate layer" },
      { keys: ["Delete"], description: "Delete selected" },
      { keys: ["Ctrl", "A"], description: "Select all" },
    ],
  },
  {
    category: "Layers",
    items: [
      { keys: ["↑"], description: "Select layer above" },
      { keys: ["↓"], description: "Select layer below" },
      { keys: ["Ctrl", "↑"], description: "Move layer up" },
      { keys: ["Ctrl", "↓"], description: "Move layer down" },
      { keys: ["1-9"], description: "Toggle layer visibility" },
      { keys: ["Shift", "1-9"], description: "Solo layer" },
    ],
  },
  {
    category: "View",
    items: [
      { keys: ["F"], description: "Toggle fullscreen" },
      { keys: ["Ctrl", "="], description: "Zoom in" },
      { keys: ["Ctrl", "-"], description: "Zoom out" },
      { keys: ["Ctrl", "0"], description: "Reset zoom" },
      { keys: ["G"], description: "Toggle grid" },
      { keys: ["Ctrl", "Shift", "P"], description: "Toggle performance overlay" },
    ],
  },
  {
    category: "General",
    items: [
      { keys: ["Ctrl", "S"], description: "Save project" },
      { keys: ["Ctrl", "E"], description: "Export" },
      { keys: ["Ctrl", "N"], description: "New project" },
      { keys: ["Ctrl", "O"], description: "Open project" },
      { keys: ["?"], description: "Show shortcuts" },
      { keys: ["Escape"], description: "Close modal / Deselect" },
    ],
  },
];

export function ShortcutsModal({ isOpen, onClose }: ShortcutsModalProps) {
  const [search, setSearch] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "?" && !e.ctrlKey && !e.metaKey) {
        const target = e.target as HTMLElement;
        if (target.tagName !== "INPUT" && target.tagName !== "TEXTAREA") {
          e.preventDefault();
          onClose();
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredShortcuts = SHORTCUTS.map((category) => ({
    ...category,
    items: category.items.filter(
      (item) =>
        item.description.toLowerCase().includes(search.toLowerCase()) ||
        item.keys.some((key) =>
          key.toLowerCase().includes(search.toLowerCase())
        )
    ),
  })).filter((category) => category.items.length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <h2 className="text-lg font-semibold">Keyboard Shortcuts</h2>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-white/5">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search shortcuts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface-2 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-zinc-500"
              autoFocus
            />
          </div>
        </div>

        {/* Shortcuts */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {filteredShortcuts.map((category) => (
            <div key={category.category}>
              <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">
                {category.category}
              </h3>
              <div className="space-y-2">
                {category.items.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                  >
                    <span className="text-sm text-zinc-300">
                      {item.description}
                    </span>
                    <div className="flex gap-1">
                      {item.keys.map((key, j) => (
                        <span key={j}>
                          <kbd className="px-2 py-1 bg-surface-2 border border-white/10 rounded text-xs text-zinc-400 font-mono">
                            {key}
                          </kbd>
                          {j < item.keys.length - 1 && (
                            <span className="text-zinc-600 mx-0.5">+</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {filteredShortcuts.length === 0 && (
            <div className="text-center py-8 text-zinc-500">
              No shortcuts found matching "{search}"
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 text-xs text-zinc-500">
          Press <kbd className="px-1.5 py-0.5 bg-surface-2 border border-white/10 rounded">?</kbd> to toggle this dialog
        </div>
      </Card>
    </div>
  );
}
