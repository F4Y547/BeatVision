import { create } from "zustand";
import type {
  Project,
  Asset,
  SceneConfig,
  AudioAnalysis,
  VisualizerMode,
} from "@/types";
import type { Layer } from "@/components/editor/layer-panel";
import type { AudioMapping } from "@/components/editor/mapping-controls";
import type { PresetConfig } from "@/lib/presets";

interface EditorState {
  project: Project | null;
  audioAsset: Asset | null;
  artworkAsset: Asset | null;
  analysis: AudioAnalysis | null;
  scene: SceneConfig;
  isPlaying: boolean;
  currentTime: number;
  zoom: number;
  selectedLayerId: string | null;
  layers: Layer[];
  audioMappings: AudioMapping[];
  currentPreset: PresetConfig | null;
  isFullscreen: boolean;
  isExporting: boolean;
  exportProgress: number;

  setProject: (project: Project | null) => void;
  setAudioAsset: (asset: Asset | null) => void;
  setArtworkAsset: (asset: Asset | null) => void;
  setAnalysis: (analysis: AudioAnalysis | null) => void;
  setMode: (mode: VisualizerMode) => void;
  setPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
  setZoom: (zoom: number) => void;
  setSelectedLayerId: (id: string | null) => void;
  updateScene: (partial: Partial<SceneConfig>) => void;
  setLayers: (layers: Layer[]) => void;
  addLayer: (layer: Layer) => void;
  updateLayer: (id: string, updates: Partial<Layer>) => void;
  removeLayer: (id: string) => void;
  reorderLayers: (fromIndex: number, toIndex: number) => void;
  setAudioMappings: (mappings: AudioMapping[]) => void;
  addAudioMapping: (mapping: AudioMapping) => void;
  updateAudioMapping: (id: string, updates: Partial<AudioMapping>) => void;
  removeAudioMapping: (id: string) => void;
  applyPreset: (preset: PresetConfig) => void;
  setFullscreen: (fullscreen: boolean) => void;
  setExporting: (exporting: boolean) => void;
  setExportProgress: (progress: number) => void;
}

const defaultLayers: Layer[] = [
  { id: "bg", type: "background", name: "Background", visible: true, locked: false, opacity: 100 },
  { id: "artwork", type: "artwork", name: "Artwork", visible: true, locked: false, opacity: 100 },
  { id: "spectrum", type: "spectrum", name: "Spectrum", visible: true, locked: false, opacity: 100 },
  { id: "particles", type: "particles", name: "Particles", visible: true, locked: false, opacity: 80 },
];

const defaultScene: SceneConfig = {
  mode: "circular-spectrum",
  background: {
    color: "#0a0a0f",
    imageId: null,
  },
  layers: [],
  audioMapping: [
    { source: "bass", target: "scale", min: 0.8, max: 1.5, smoothing: 0.8 },
    { source: "bass", target: "glow", min: 0, max: 1, smoothing: 0.7 },
    {
      source: "volume",
      target: "opacity",
      min: 0.5,
      max: 1,
      smoothing: 0.9,
    },
  ],
  presetId: null,
};

export const useEditorStore = create<EditorState>((set) => ({
  project: null,
  audioAsset: null,
  artworkAsset: null,
  analysis: null,
  scene: defaultScene,
  isPlaying: false,
  currentTime: 0,
  zoom: 1,
  selectedLayerId: null,
  layers: defaultLayers,
  audioMappings: [],
  currentPreset: null,
  isFullscreen: false,
  isExporting: false,
  exportProgress: 0,

  setProject: (project) => set({ project }),
  setAudioAsset: (audioAsset) => set({ audioAsset }),
  setArtworkAsset: (artworkAsset) => set({ artworkAsset }),
  setAnalysis: (analysis) => set({ analysis }),
  setMode: (mode) =>
    set((state) => ({
      scene: { ...state.scene, mode },
    })),
  setPlaying: (isPlaying) => set({ isPlaying }),
  setCurrentTime: (currentTime) => set({ currentTime }),
  setZoom: (zoom) => set({ zoom }),
  setSelectedLayerId: (selectedLayerId) => set({ selectedLayerId }),
  updateScene: (partial) =>
    set((state) => ({
      scene: { ...state.scene, ...partial },
    })),

  setLayers: (layers) => set({ layers }),
  addLayer: (layer) =>
    set((state) => ({
      layers: [...state.layers, layer],
    })),
  updateLayer: (id, updates) =>
    set((state) => ({
      layers: state.layers.map((l) =>
        l.id === id ? { ...l, ...updates } : l
      ),
    })),
  removeLayer: (id) =>
    set((state) => ({
      layers: state.layers.filter((l) => l.id !== id),
      selectedLayerId:
        state.selectedLayerId === id ? null : state.selectedLayerId,
    })),
  reorderLayers: (fromIndex, toIndex) =>
    set((state) => {
      const newLayers = [...state.layers];
      const [removed] = newLayers.splice(fromIndex, 1);
      newLayers.splice(toIndex, 0, removed);
      return { layers: newLayers };
    }),

  setAudioMappings: (audioMappings) => set({ audioMappings }),
  addAudioMapping: (mapping) =>
    set((state) => ({
      audioMappings: [...state.audioMappings, mapping],
    })),
  updateAudioMapping: (id, updates) =>
    set((state) => ({
      audioMappings: state.audioMappings.map((m) =>
        m.id === id ? { ...m, ...updates } : m
      ),
    })),
  removeAudioMapping: (id) =>
    set((state) => ({
      audioMappings: state.audioMappings.filter((m) => m.id !== id),
    })),

  applyPreset: (preset) =>
    set((state) => ({
      currentPreset: preset,
      scene: {
        ...state.scene,
        mode: preset.mode,
      },
    })),

  setFullscreen: (isFullscreen) => set({ isFullscreen }),
  setExporting: (isExporting) => set({ isExporting }),
  setExportProgress: (exportProgress) => set({ exportProgress }),
}));
