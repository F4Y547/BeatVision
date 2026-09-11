"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { parseLrc, parseSrt, parseVtt, generateLrc, type LyricsData, type LyricLine } from "@/lib/lyrics";

interface LyricsEditorProps {
  lyrics: LyricsData | null;
  onChange: (lyrics: LyricsData) => void;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
}

export function LyricsEditor({
  lyrics,
  onChange,
  currentTime,
  duration,
  onSeek,
}: LyricsEditorProps) {
  const [editingLine, setEditingLine] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [importFormat, setImportFormat] = useState<"lrc" | "srt" | "vtt">("lrc");

  const lines = lyrics?.lines || [];
  const currentLine = lines.find(
    (l) => currentTime >= l.startTime && currentTime <= l.endTime
  );

  const addLine = useCallback(() => {
    const newLine: LyricLine = {
      id: crypto.randomUUID(),
      startTime: currentTime,
      endTime: Math.min(currentTime + 3, duration),
      text: "New lyric line",
    };

    const newLines = [...lines, newLine].sort(
      (a, b) => a.startTime - b.startTime
    );
    onChange({ lines: newLines });
    setEditingLine(newLine.id);
    setEditText(newLine.text);
  }, [lines, currentTime, duration, onChange]);

  const updateLine = useCallback(
    (id: string, updates: Partial<LyricLine>) => {
      const newLines = lines.map((l) =>
        l.id === id ? { ...l, ...updates } : l
      );
      onChange({ lines: newLines });
    },
    [lines, onChange]
  );

  const deleteLine = useCallback(
    (id: string) => {
      onChange({ lines: lines.filter((l) => l.id !== id) });
    },
    [lines, onChange]
  );

  const handleImport = useCallback(
    (content: string) => {
      let parsed: LyricsData;
      switch (importFormat) {
        case "lrc":
          parsed = parseLrc(content);
          break;
        case "srt":
          parsed = parseSrt(content);
          break;
        case "vtt":
          parsed = parseVtt(content);
          break;
        default:
          return;
      }
      onChange(parsed);
    },
    [importFormat, onChange]
  );

  const handleExport = useCallback(() => {
    if (!lyrics) return;
    const lrc = generateLrc(lyrics);
    const blob = new Blob([lrc], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lyrics.lrc";
    a.click();
    URL.revokeObjectURL(url);
  }, [lyrics]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${m}:${s.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-surface-1 rounded-xl border border-white/5 p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-300">Lyrics Editor</h3>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => handleExport()}>
            Export LRC
          </Button>
        </div>
      </div>

      {/* Import */}
      <div className="flex gap-2">
        <select
          value={importFormat}
          onChange={(e) => setImportFormat(e.target.value as any)}
          className="bg-surface-2 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
        >
          <option value="lrc">LRC</option>
          <option value="srt">SRT</option>
          <option value="vtt">VTT</option>
        </select>
        <label className="flex-1">
          <input
            type="file"
            accept=".lrc,.srt,.vtt,.txt"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                  handleImport(ev.target?.result as string);
                };
                reader.readAsText(file);
              }
            }}
          />
          <div className="cursor-pointer bg-surface-2 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-zinc-400 hover:text-white text-center">
            Import Lyrics File
          </div>
        </label>
      </div>

      {/* Current Time */}
      <div className="flex items-center gap-3 text-xs text-zinc-500">
        <span>Current: {formatTime(currentTime)}</span>
        <span>|</span>
        <span>Duration: {formatTime(duration)}</span>
        {currentLine && (
          <>
            <span>|</span>
            <span className="text-beatvision-400">
              Active: {currentLine.text}
            </span>
          </>
        )}
      </div>

      {/* Lines */}
      <div className="max-h-64 overflow-y-auto space-y-1">
        {lines.length === 0 ? (
          <div className="text-center py-8 text-zinc-500">
            <p>No lyrics yet</p>
            <p className="text-xs mt-1">
              Add lines or import a lyrics file
            </p>
          </div>
        ) : (
          lines.map((line) => (
            <div
              key={line.id}
              className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                currentLine?.id === line.id
                  ? "bg-beatvision-500/20 border border-beatvision-500/30"
                  : "hover:bg-surface-2"
              }`}
            >
              {/* Time */}
              <button
                onClick={() => onSeek(line.startTime)}
                className="text-[10px] text-zinc-500 hover:text-beatvision-400 font-mono w-14 text-left shrink-0"
              >
                {formatTime(line.startTime)}
              </button>

              {/* Text */}
              {editingLine === line.id ? (
                <input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onBlur={() => {
                    updateLine(line.id, { text: editText });
                    setEditingLine(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      updateLine(line.id, { text: editText });
                      setEditingLine(null);
                    }
                  }}
                  className="flex-1 bg-surface-2 border border-white/10 rounded px-2 py-1 text-sm text-white"
                  autoFocus
                />
              ) : (
                <span
                  className="flex-1 text-sm text-zinc-300 cursor-pointer hover:text-white truncate"
                  onClick={() => {
                    setEditingLine(line.id);
                    setEditText(line.text);
                  }}
                >
                  {line.text}
                </span>
              )}

              {/* Actions */}
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => {
                    updateLine(line.id, { startTime: currentTime });
                  }}
                  className="p-1 text-zinc-500 hover:text-beatvision-400"
                  title="Set start time to current"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                <button
                  onClick={() => deleteLine(line.id)}
                  className="p-1 text-zinc-500 hover:text-red-400"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Line */}
      <Button variant="secondary" className="w-full" onClick={addLine}>
        + Add Line at Current Time
      </Button>
    </div>
  );
}
