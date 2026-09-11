import { create } from "zustand";
import type { Keyframe } from "@/components/editor/keyframe-editor";

interface KeyframeState {
  keyframes: Record<string, Keyframe[]>; // property -> keyframes
  selectedProperty: string;
  
  addKeyframe: (property: string, keyframe: Keyframe) => void;
  updateKeyframe: (property: string, id: string, updates: Partial<Keyframe>) => void;
  deleteKeyframe: (property: string, id: string) => void;
  setKeyframes: (property: string, keyframes: Keyframe[]) => void;
  setSelectedProperty: (property: string) => void;
  getPropertyKeyframes: (property: string) => Keyframe[];
}

export const useKeyframeStore = create<KeyframeState>((set, get) => ({
  keyframes: {},
  selectedProperty: "scale",

  addKeyframe: (property, keyframe) => {
    set((state) => ({
      keyframes: {
        ...state.keyframes,
        [property]: [...(state.keyframes[property] || []), keyframe],
      },
    }));
  },

  updateKeyframe: (property, id, updates) => {
    set((state) => ({
      keyframes: {
        ...state.keyframes,
        [property]: (state.keyframes[property] || []).map((k) =>
          k.id === id ? { ...k, ...updates } : k
        ),
      },
    }));
  },

  deleteKeyframe: (property, id) => {
    set((state) => ({
      keyframes: {
        ...state.keyframes,
        [property]: (state.keyframes[property] || []).filter(
          (k) => k.id !== id
        ),
      },
    }));
  },

  setKeyframes: (property, keyframes) => {
    set((state) => ({
      keyframes: {
        ...state.keyframes,
        [property]: keyframes,
      },
    }));
  },

  setSelectedProperty: (property) => {
    set({ selectedProperty: property });
  },

  getPropertyKeyframes: (property) => {
    return get().keyframes[property] || [];
  },
}));

// Available properties for keyframing
export const KEYFRAMEABLE_PROPERTIES = [
  { id: "scale", label: "Scale", min: 0, max: 3, default: 1 },
  { id: "rotation", label: "Rotation", min: 0, max: 360, default: 0 },
  { id: "opacity", label: "Opacity", min: 0, max: 1, default: 1 },
  { id: "positionX", label: "Position X", min: -2, max: 2, default: 0 },
  { id: "positionY", label: "Position Y", min: -2, max: 2, default: 0 },
  { id: "bloomIntensity", label: "Bloom", min: 0, max: 3, default: 0.8 },
  { id: "particleCount", label: "Particle Count", min: 0, max: 5000, default: 1000 },
  { id: "colorIntensity", label: "Color Intensity", min: 0, max: 2, default: 1 },
  { id: "sensitivity", label: "Audio Sensitivity", min: 0, max: 3, default: 1 },
  { id: "smoothing", label: "Smoothing", min: 0, max: 1, default: 0.8 },
];
