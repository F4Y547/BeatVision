"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEditorStore } from "@/stores/editor";
import { VisualizerCanvas } from "@/components/editor/visualizer-canvas";
import { ExportModal } from "@/components/editor/export-modal";
import { PresetBrowser } from "@/components/editor/preset-browser";
import { Timeline } from "@/components/editor/timeline";
import { LayerPanel, type Layer } from "@/components/editor/layer-panel";
import { MappingControls, type AudioMapping } from "@/components/editor/mapping-controls";
import { extractColorsFromImage } from "@/lib/color-extraction";
import type { VisualizerMode } from "@/types";

const visualizerModes: { id: VisualizerMode; label: string }[] = [
  { id: "circular-spectrum", label: "Circular Spectrum" },
  { id: "logo-reactor", label: "Logo Reactor" },
  { id: "linear-spectrum", label: "Linear Spectrum" },
  { id: "waveform", label: "Waveform" },
  { id: "particle-field", label: "Particle Field" },
  { id: "cinematic-artwork", label: "Cinematic Artwork" },
  { id: "minimal-pulse", label: "Minimal Pulse" },
  { id: "radial-equalizer", label: "Radial Equalizer" },
  { id: "glitch-impact", label: "Glitch Impact" },
  { id: "ambient-gradient", label: "Ambient Gradient" },
];

function InspectorControls() {
  const { scene } = useEditorStore();
  const [intensity, setIntensity] = useState(50);
  const [glow, setGlow] = useState(30);
  const [opacity, setOpacity] = useState(100);
  const [smoothing, setSmoothing] = useState(80);
  const [bgColor, setBgColor] = useState(scene.background.color || "#0a0a0f");

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-300">Intensity</label>
        <input
          type="range"
          min="0"
          max="100"
          value={intensity}
          onChange={(e) => setIntensity(Number(e.target.value))}
          aria-label="Intensity"
          className="w-full accent-beatvision-500 focus-visible:ring-2 focus-visible:ring-beatvision-500 focus-visible:outline-none"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-300">Glow</label>
        <input
          type="range"
          min="0"
          max="100"
          value={glow}
          onChange={(e) => setGlow(Number(e.target.value))}
          aria-label="Glow"
          className="w-full accent-beatvision-500 focus-visible:ring-2 focus-visible:ring-beatvision-500 focus-visible:outline-none"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-300">Opacity</label>
        <input
          type="range"
          min="0"
          max="100"
          value={opacity}
          onChange={(e) => setOpacity(Number(e.target.value))}
          aria-label="Opacity"
          className="w-full accent-beatvision-500 focus-visible:ring-2 focus-visible:ring-beatvision-500 focus-visible:outline-none"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-300">Smoothing</label>
        <input
          type="range"
          min="0"
          max="100"
          value={smoothing}
          onChange={(e) => setSmoothing(Number(e.target.value))}
          aria-label="Smoothing"
          className="w-full accent-beatvision-500 focus-visible:ring-2 focus-visible:ring-beatvision-500 focus-visible:outline-none"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-300">Background Color</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={bgColor}
            onChange={(e) => setBgColor(e.target.value)}
            aria-label="Background color picker"
            className="w-8 h-8 rounded-lg border border-white/10 cursor-pointer"
          />
          <input
            type="text"
            value={bgColor}
            onChange={(e) => setBgColor(e.target.value)}
            aria-label="Background color hex"
            className="flex-1 bg-surface-2 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-beatvision-500"
          />
        </div>
      </div>
    </div>
  );
}

export default function EditorPage() {
  const params = useParams();
  const projectId = params.id as string;

  const {
    scene,
    setMode,
    isPlaying,
    setPlaying,
    currentTime,
    setCurrentTime,
    audioAsset,
    layers,
    addLayer,
    updateLayer,
    removeLayer,
    reorderLayers,
    audioMappings,
    addAudioMapping,
    updateAudioMapping,
    removeAudioMapping,
    currentPreset,
    applyPreset,
    selectedLayerId,
    setSelectedLayerId,
  } = useEditorStore();

  const [showExport, setShowExport] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [audioData, setAudioData] = useState<Float32Array | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [rightPanel, setRightPanel] = useState<"inspector" | "mapping">("inspector");
  const [duration, setDuration] = useState(180);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [leftPanelOpen, setLeftPanelOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [projectName, setProjectName] = useState("Loading...");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>(-1);

  const startAudioAnalysis = useCallback(() => {
    if (!audioRef.current || !audioContextRef.current || !analyserRef.current)
      return;

    const analyser = analyserRef.current;
    const dataArray = new Float32Array(analyser.frequencyBinCount);

    const updateAudioData = () => {
      analyser.getFloatFrequencyData(dataArray);
      setAudioData(new Float32Array(dataArray));
      animationFrameRef.current = requestAnimationFrame(updateAudioData);
    };

    updateAudioData();
  }, []);

  const stopAudioAnalysis = useCallback(() => {
    cancelAnimationFrame(animationFrameRef.current);
  }, []);

  useEffect(() => {
    return () => {
      stopAudioAnalysis();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [stopAudioAnalysis]);

  // Load project data from API
  useEffect(() => {
    if (!projectId) return;

    fetch(`/api/projects/${projectId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.project) {
          setProjectName(data.project.name);
          if (data.project.duration) {
            setDuration(data.project.duration);
          }
          // Load audio URL from asset metadata
          if (data.project.audioAsset?.metadata) {
            try {
              const meta = JSON.parse(data.project.audioAsset.metadata);
              if (meta.url) setAudioUrl(meta.url);
            } catch {}
          }
        }
      })
      .catch(() => {
        setProjectName("Untitled Project");
      });
  }, [projectId]);

  const handlePlayPause = async () => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.src = audioUrl || audioAsset?.storageKey || "";

      audioRef.current.addEventListener("loadedmetadata", () => {
        if (audioRef.current) {
          setDuration(audioRef.current.duration || 180);
        }
      });

      audioRef.current.addEventListener("error", () => {
        setAudioError("Failed to load audio file.");
      });

      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaElementSource(
        audioRef.current
      );
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;

      source.connect(analyserRef.current);
      analyserRef.current.connect(audioContextRef.current.destination);

      audioRef.current.addEventListener("timeupdate", () => {
        setCurrentTime(audioRef.current?.currentTime || 0);
      });

      audioRef.current.addEventListener("ended", () => {
        setPlaying(false);
        stopAudioAnalysis();
      });
    }

    if (isPlaying) {
      audioRef.current.pause();
      setPlaying(false);
      stopAudioAnalysis();
    } else {
      setAudioError(null);
      await audioContextRef.current?.resume();
      await audioRef.current.play();
      setPlaying(true);
      startAudioAnalysis();
    }
  };

  const handleSeek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAddLayer = (type: Layer["type"]) => {
    const newLayer: Layer = {
      id: crypto.randomUUID(),
      type,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${layers.length + 1}`,
      visible: true,
      locked: false,
      opacity: 100,
    };
    addLayer(newLayer);
  };

  const handleAddMapping = () => {
    const newMapping: AudioMapping = {
      id: crypto.randomUUID(),
      source: "bass",
      target: "scale",
      min: 0.8,
      max: 1.5,
      smoothing: 0.8,
      curve: "linear",
      enabled: true,
    };
    addAudioMapping(newMapping);
  };

  const handleExport = async (config: any) => {
    setIsExporting(true);
    setShowExport(false);
    alert("Export started!");
    setIsExporting(false);
  };

  const handleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Fullscreen not supported or blocked
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-2 md:px-4 py-2 border-b border-white/5 bg-surface-1 gap-2">
        <div className="flex items-center gap-2 md:gap-4 min-w-0">
          <Link
            href={`/projects/${projectId}`}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-surface-2 transition-colors shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <Button variant="ghost" size="sm" className="lg:hidden shrink-0" onClick={() => setLeftPanelOpen(true)}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </Button>
          <select
            value={scene.mode}
            onChange={(e) => setMode(e.target.value as VisualizerMode)}
            aria-label="Visualizer mode"
            className="bg-surface-2 border border-white/10 rounded-lg px-2 md:px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-beatvision-500 shrink-0"
          >
            {visualizerModes.map((mode) => (
              <option key={mode.id} value={mode.id}>
                {mode.label}
              </option>
            ))}
          </select>
          <span className="hidden md:inline text-sm text-zinc-400 truncate max-w-[200px]">{projectName}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPresets(true)}
            className="hidden sm:inline-flex shrink-0"
          >
            Presets
          </Button>
        </div>
        <div className="flex items-center gap-1 md:gap-2 shrink-0">
          <Button variant="ghost" size="sm" className="hidden md:inline-flex">
            Undo
          </Button>
          <Button variant="ghost" size="sm" className="hidden md:inline-flex">
            Redo
          </Button>
          <Button variant="ghost" size="sm" onClick={handleFullscreen} className="hidden lg:inline-flex">
            Fullscreen
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowExport(true)}
            disabled={isExporting}
          >
            {isExporting ? "Exporting..." : "Export"}
          </Button>
          <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setRightPanelOpen(true)}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Left Panel Overlay */}
        {leftPanelOpen && (
          <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setLeftPanelOpen(false)}>
            <div className="absolute inset-0 bg-black/50" />
            <aside className="absolute left-0 top-0 bottom-0 w-64 bg-surface-1 border-r border-white/5 flex flex-col" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-3 py-2 border-b border-white/5">
                <span className="text-sm font-medium">Layers</span>
                <button onClick={() => setLeftPanelOpen(false)} className="p-1 text-zinc-400 hover:text-white">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <LayerPanel
                layers={layers}
                selectedLayerId={selectedLayerId}
                onSelectLayer={setSelectedLayerId}
                onUpdateLayer={updateLayer}
                onReorderLayers={reorderLayers}
                onAddLayer={handleAddLayer}
                onRemoveLayer={removeLayer}
              />
            </aside>
          </div>
        )}

        {/* Desktop Left Panel */}
        <aside className="hidden lg:flex w-64 border-r border-white/5 bg-surface-1 flex-col">
          <LayerPanel
            layers={layers}
            selectedLayerId={selectedLayerId}
            onSelectLayer={setSelectedLayerId}
            onUpdateLayer={updateLayer}
            onReorderLayers={reorderLayers}
            onAddLayer={handleAddLayer}
            onRemoveLayer={removeLayer}
          />
        </aside>

        {/* Center - Canvas */}
        <main className="flex-1 flex flex-col">
          <div className="flex-1 flex items-center justify-center bg-surface-0 p-2 md:p-4">
            <div className="relative w-full max-w-4xl aspect-video rounded-xl bg-surface-1 border border-white/5 overflow-hidden">
              <VisualizerCanvas
                width={1920}
                height={1080}
                mode={scene.mode}
                audioData={audioData}
                isPlaying={isPlaying}
              />
            </div>
          </div>

          {/* Audio Error */}
          {audioError && (
            <div className="px-4 py-2 bg-red-500/10 border-t border-red-500/20 text-red-400 text-sm text-center">
              {audioError}
            </div>
          )}

          {/* Playback Controls */}
          <div className="flex items-center justify-center gap-2 md:gap-4 py-2 md:py-3 border-t border-white/5 bg-surface-1">
            <button
              onClick={() => handleSeek(0)}
              aria-label="Rewind"
              className="p-2 text-zinc-400 hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-beatvision-500 focus-visible:outline-none rounded"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
              </svg>
            </button>
            <button
              onClick={handlePlayPause}
              aria-label={isPlaying ? "Pause" : "Play"}
              className="p-3 rounded-full bg-beatvision-600 hover:bg-beatvision-700 text-white transition-colors focus-visible:ring-2 focus-visible:ring-beatvision-400 focus-visible:outline-none"
            >
              {isPlaying ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </button>
            <span className="text-xs md:text-sm text-zinc-400 font-mono min-w-[60px] md:min-w-[80px]">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Timeline */}
          <div className="h-24 md:h-40 border-t border-white/5 bg-surface-1">
            <Timeline
              duration={duration}
              currentTime={currentTime}
              isPlaying={isPlaying}
              audioData={audioData}
              onSeek={handleSeek}
            />
          </div>
        </main>

        {/* Mobile Right Panel Overlay */}
        {rightPanelOpen && (
          <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setRightPanelOpen(false)}>
            <div className="absolute inset-0 bg-black/50" />
            <aside className="absolute right-0 top-0 bottom-0 w-72 bg-surface-1 border-l border-white/5 flex flex-col" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-3 py-2 border-b border-white/5">
                <div className="flex gap-1">
                  <button onClick={() => setRightPanel("inspector")} className={`text-sm px-2 py-1 rounded ${rightPanel === "inspector" ? "text-beatvision-400" : "text-zinc-400"}`}>Inspector</button>
                  <button onClick={() => setRightPanel("mapping")} className={`text-sm px-2 py-1 rounded ${rightPanel === "mapping" ? "text-beatvision-400" : "text-zinc-400"}`}>Mapping</button>
                </div>
                <button onClick={() => setRightPanelOpen(false)} className="p-1 text-zinc-400 hover:text-white">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-auto p-3">
                {rightPanel === "inspector" ? (
                  <InspectorControls />
                ) : (
                  <MappingControls
                    mappings={audioMappings}
                    onUpdateMapping={updateAudioMapping}
                    onAddMapping={handleAddMapping}
                    onRemoveMapping={removeAudioMapping}
                  />
                )}
              </div>
            </aside>
          </div>
        )}

        {/* Desktop Right Panel */}
        <aside className="hidden lg:flex w-72 border-l border-white/5 bg-surface-1 flex flex-col">
          {/* Panel Tabs */}
          <div className="flex border-b border-white/5">
            <button
              onClick={() => setRightPanel("inspector")}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                rightPanel === "inspector"
                  ? "text-beatvision-400 border-b-2 border-beatvision-500"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Inspector
            </button>
            <button
              onClick={() => setRightPanel("mapping")}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                rightPanel === "mapping"
                  ? "text-beatvision-400 border-b-2 border-beatvision-500"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Mapping
            </button>
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-auto p-3">
            {rightPanel === "inspector" ? (
              <InspectorControls />
            ) : (
              <MappingControls
                mappings={audioMappings}
                onUpdateMapping={updateAudioMapping}
                onAddMapping={handleAddMapping}
                onRemoveMapping={removeAudioMapping}
              />
            )}
          </div>
        </aside>
      </div>

      {/* Modals */}
      <ExportModal
        isOpen={showExport}
        onClose={() => setShowExport(false)}
        onExport={handleExport}
      />
      <PresetBrowser
        isOpen={showPresets}
        onClose={() => setShowPresets(false)}
        onSelectPreset={applyPreset}
        currentPresetId={currentPreset?.id}
      />
    </div>
  );
}
