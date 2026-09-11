"use client";

import { useEffect, useRef, useCallback } from "react";

interface AutosaveOptions {
  enabled: boolean;
  intervalMs?: number;
  onSave: () => Promise<void>;
  onAutoSave?: (timestamp: Date) => void;
}

export function useAutosave({
  enabled,
  intervalMs = 30000, // 30 seconds default
  onSave,
  onAutoSave,
}: AutosaveOptions) {
  const lastSavedRef = useRef<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasChangesRef = useRef(false);

  const save = useCallback(async () => {
    try {
      await onSave();
      lastSavedRef.current = new Date();
      hasChangesRef.current = false;
      onAutoSave?.(lastSavedRef.current);
    } catch (error) {
      console.error("Autosave failed:", error);
    }
  }, [onSave, onAutoSave]);

  const markDirty = useCallback(() => {
    hasChangesRef.current = true;
  }, []);

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      if (hasChangesRef.current) {
        save();
      }
    }, intervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, intervalMs, save]);

  // Save before page unload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChangesRef.current) {
        e.preventDefault();
        e.returnValue = "";
        // Attempt synchronous save
        save();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [save]);

  return {
    lastSaved: lastSavedRef.current,
    hasChanges: hasChangesRef.current,
    saveNow: save,
    markDirty,
  };
}

// Format last saved time
export function formatLastSaved(date: Date | null): string {
  if (!date) return "Not saved";
  
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (seconds < 10) return "Saved just now";
  if (seconds < 60) return `Saved ${seconds}s ago`;
  if (minutes < 60) return `Saved ${minutes}m ago`;
  if (hours < 24) return `Saved ${hours}h ago`;
  return `Saved on ${date.toLocaleDateString()}`;
}
