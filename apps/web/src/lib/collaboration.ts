import * as Y from "yjs";

export interface CollaborationUser {
  id: string;
  name: string;
  color: string;
  cursor?: { x: number; y: number };
  isActive?: boolean;
}

export interface CollaborationState {
  doc: Y.Doc;
  users: Map<string, CollaborationUser>;
  isHost: boolean;
}

// Generate a random color for the user
function generateUserColor(): string {
  const colors = [
    "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4",
    "#FFEAA7", "#DDA0DD", "#98D8C8", "#F7DC6F",
    "#BB8FCE", "#85C1E9", "#82E0AA", "#F8C471",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

export class CollaborationManager {
  private doc: Y.Doc;
  private projectId: string;
  private userId: string;
  private userName: string;
  private userColor: string;
  private users: Map<string, CollaborationUser> = new Map();
  private listeners: Map<string, Set<Function>> = new Map();

  constructor(
    projectId: string,
    userId: string,
    userName: string,
    provider?: any // WebSocket provider
  ) {
    this.projectId = projectId;
    this.userId = userId;
    this.userName = userName;
    this.userColor = generateUserColor();

    // Create Yjs document
    this.doc = new Y.Doc();

    // Add self to users
    this.users.set(userId, {
      id: userId,
      name: userName,
      color: this.userColor,
      isActive: true,
    });

    // If provider is provided, sync
    if (provider) {
      // Setup sync with provider
    }
  }

  // Get shared types
  getLayers() {
    return this.doc.getArray("layers");
  }

  getPresets() {
    return this.doc.getMap("presets");
  }

  getSettings() {
    return this.doc.getMap("settings");
  }

  // Layer operations
  addLayer(layer: any) {
    const layers = this.getLayers();
    this.doc.transact(() => {
      const yLayer = new Y.Map();
      Object.entries(layer).forEach(([key, value]) => {
        yLayer.set(key, value);
      });
      layers.push([yLayer]);
    });
  }

  updateLayer(index: number, updates: Record<string, any>) {
    const layers = this.getLayers();
    this.doc.transact(() => {
      const layer = layers.get(index) as Y.Map<any>;
      if (layer) {
        Object.entries(updates).forEach(([key, value]) => {
          layer.set(key, value);
        });
      }
    });
  }

  removeLayer(index: number) {
    const layers = this.getLayers();
    this.doc.transact(() => {
      layers.delete(index, 1);
    });
  }

  moveLayer(from: number, to: number) {
    const layers = this.getLayers();
    this.doc.transact(() => {
      const [item] = layers.toArray().splice(from, 1);
      layers.insert(to, [item]);
    });
  }

  // Cursor/selection awareness
  updateCursor(x: number, y: number) {
    const user = this.users.get(this.userId);
    if (user) {
      user.cursor = { x, y };
      this.emit("awareness-change", this.getRemoteUsers());
    }
  }

  updateSelection(selection: { layerId: string; property?: string }) {
    // Store selection locally
    this.emit("selection-change", { userId: this.userId, selection });
  }

  getRemoteUsers(): CollaborationUser[] {
    return Array.from(this.users.values()).filter(
      (u) => u.id !== this.userId
    );
  }

  getAllUsers(): CollaborationUser[] {
    return Array.from(this.users.values());
  }

  addUser(user: CollaborationUser) {
    this.users.set(user.id, user);
    this.emit("user-joined", user);
  }

  removeUser(userId: string) {
    const user = this.users.get(userId);
    this.users.delete(userId);
    if (user) {
      this.emit("user-left", user);
    }
  }

  // Event handling
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // Setup Yjs observers
    if (event === "layers-change") {
      this.getLayers().observe((event) => {
        callback(event);
      });
    }
  }

  off(event: string, callback: Function) {
    this.listeners.get(event)?.delete(callback);
  }

  private emit(event: string, data?: any) {
    this.listeners.get(event)?.forEach((cb) => cb(data));
  }

  // Encode/decode for persistence
  encodeState(): Uint8Array {
    return Y.encodeStateAsUpdate(this.doc);
  }

  decodeState(state: Uint8Array) {
    Y.applyUpdate(this.doc, state);
  }

  // Destroy
  destroy() {
    this.doc.destroy();
    this.listeners.clear();
    this.users.clear();
  }
}

// Simulated collaboration for demo (no real server needed)
export class SimulatedCollaboration {
  private manager: CollaborationManager;
  private remoteUsers: CollaborationUser[] = [];
  private interval: ReturnType<typeof setInterval> | null = null;

  constructor(projectId: string, userId: string, userName: string) {
    this.manager = new CollaborationManager(projectId, userId, userName);

    // Simulate remote users
    this.remoteUsers = [
      { id: "user-2", name: "Collaborator 1", color: "#4ECDC4" },
      { id: "user-3", name: "Collaborator 2", color: "#FF6B6B" },
    ];
  }

  start() {
    // Simulate cursor movements
    this.interval = setInterval(() => {
      this.remoteUsers.forEach((user) => {
        user.cursor = {
          x: Math.random() * 100,
          y: Math.random() * 100,
        };
      });
      this.manager["listeners"]
        .get("awareness-change")
        ?.forEach((cb: Function) => cb(this.remoteUsers));
    }, 1000);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
    }
    this.manager.destroy();
  }

  getManager() {
    return this.manager;
  }

  getRemoteUsers() {
    return this.remoteUsers;
  }
}
