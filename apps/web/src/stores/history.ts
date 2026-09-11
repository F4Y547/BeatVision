import { create } from "zustand";

interface HistoryEntry {
  id: string;
  timestamp: number;
  state: any;
  description: string;
}

interface HistoryState {
  past: HistoryEntry[];
  future: HistoryEntry[];
  maxHistory: number;

  pushState: (state: any, description: string) => void;
  undo: () => any | null;
  redo: () => any | null;
  canUndo: () => boolean;
  canRedo: () => boolean;
  clear: () => void;
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  past: [],
  future: [],
  maxHistory: 50,

  pushState: (state: any, description: string) => {
    const entry: HistoryEntry = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      state: JSON.parse(JSON.stringify(state)),
      description,
    };

    set((prev) => ({
      past: [...prev.past.slice(-prev.maxHistory + 1), entry],
      future: [],
    }));
  },

  undo: () => {
    const { past, future } = get();
    if (past.length === 0) return null;

    const previous = past[past.length - 1];
    const newPast = past.slice(0, -1);

    set({
      past: newPast,
      future: [previous, ...future],
    });

    return previous.state;
  },

  redo: () => {
    const { past, future } = get();
    if (future.length === 0) return null;

    const next = future[0];
    const newFuture = future.slice(1);

    set({
      past: [...past, next],
      future: newFuture,
    });

    return next.state;
  },

  canUndo: () => get().past.length > 0,
  canRedo: () => get().future.length > 0,

  clear: () => set({ past: [], future: [] }),
}));

// Helper hook for using history with editor state
export function useEditorHistory() {
  const history = useHistoryStore();

  const saveState = (state: any, description: string) => {
    history.pushState(state, description);
  };

  const handleUndo = (currentState: any): any | null => {
    const previousState = history.undo();
    if (previousState) {
      history.pushState(currentState, "Before undo");
    }
    return previousState;
  };

  const handleRedo = (currentState: any): any | null => {
    const nextState = history.redo();
    if (nextState) {
      history.pushState(currentState, "Before redo");
    }
    return nextState;
  };

  return {
    saveState,
    undo: handleUndo,
    redo: handleRedo,
    canUndo: history.canUndo(),
    canRedo: history.canRedo(),
    clearHistory: history.clear,
  };
}
