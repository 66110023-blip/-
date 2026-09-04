import { FloorStation, ProductionLineLayout, HistoryLogEntry, HistoryActionType } from '../types';

const DB_NAME = 'SmartFactoryCAD_DB';
const DB_VERSION = 2;

// Object Store names
const STORES = {
  LAYOUTS: 'uploaded_layouts',
  STATIONS: 'cad_stations',
  CONFIG: 'cad_config',
  HISTORY: 'cad_history_log',
  PRESETS: 'cad_presets',
} as const;

// LocalStorage Fallback keys
const LS_KEYS = {
  LAYOUTS: 'factory_production_line_layouts_v1',
  ACTIVE_LAYOUT_ID: 'factory_active_layout_id_v1',
  LAYOUT_OPACITY: 'factory_layout_opacity_v1',
  STATIONS: 'factory_cad_stations_v1',
  CONFIG: 'factory_cad_config_v1',
  HISTORY: 'factory_cad_history_log_v1',
  PRESETS: 'factory_cad_presets_v1',
};

// Open IndexedDB database
let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.reject(new Error('IndexedDB is not supported in this environment'));
  }

  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      try {
        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
          const db = request.result;
          if (!db.objectStoreNames.contains(STORES.LAYOUTS)) {
            db.createObjectStore(STORES.LAYOUTS, { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains(STORES.STATIONS)) {
            db.createObjectStore(STORES.STATIONS, { keyPath: 'key' });
          }
          if (!db.objectStoreNames.contains(STORES.CONFIG)) {
            db.createObjectStore(STORES.CONFIG, { keyPath: 'key' });
          }
          if (!db.objectStoreNames.contains(STORES.HISTORY)) {
            db.createObjectStore(STORES.HISTORY, { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains(STORES.PRESETS)) {
            db.createObjectStore(STORES.PRESETS, { keyPath: 'id' });
          }
        };

        request.onsuccess = () => {
          resolve(request.result);
        };

        request.onerror = () => {
          console.warn('IndexedDB open error:', request.error);
          reject(request.error);
        };

        request.onblocked = () => {
          console.warn('IndexedDB open blocked by other tab');
        };
      } catch (err) {
        reject(err);
      }
    });
  }

  return dbPromise;
}

// Generic transaction helper
async function idbGet<T>(storeName: string, key: string | IDBValidKey): Promise<T | null> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.get(key);
      req.onsuccess = () => resolve((req.result as T) || null);
      req.onerror = () => resolve(null);
    });
  } catch (e) {
    return null;
  }
}

async function idbGetAll<T>(storeName: string): Promise<T[]> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.getAll();
      req.onsuccess = () => resolve((req.result as T[]) || []);
      req.onerror = () => resolve([]);
    });
  } catch (e) {
    return [];
  }
}

async function idbPut<T>(storeName: string, value: T): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.put(value);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    // Non-fatal, fallback continues
  }
}

async function idbDelete(storeName: string, key: string | IDBValidKey): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.delete(key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    // Non-fatal
  }
}

async function idbClear(storeName: string): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    // Non-fatal
  }
}

// ----------------------------------------------------------------------
// EXPORTED STORAGE API
// ----------------------------------------------------------------------

export const cadStorage = {
  // 1. Uploaded Layouts (Image Data URLs + metadata)
  async saveLayouts(layouts: ProductionLineLayout[]): Promise<void> {
    // Save to IndexedDB (handles large Base64 images easily)
    try {
      const db = await getDB();
      const tx = db.transaction(STORES.LAYOUTS, 'readwrite');
      const store = tx.objectStore(STORES.LAYOUTS);
      store.clear();
      for (const layout of layouts) {
        store.put(layout);
      }
    } catch (e) {
      console.warn('Failed saving layouts to IndexedDB:', e);
    }

    // Also attempt localStorage sync (strip huge dataUrls if quota exceeded)
    try {
      localStorage.setItem(LS_KEYS.LAYOUTS, JSON.stringify(layouts));
    } catch (quotaError) {
      try {
        // Fallback: save metadata with truncated dataUrl in localStorage
        const lightLayouts = layouts.map((l) => ({
          ...l,
          dataUrl: l.dataUrl.length > 200000 ? l.dataUrl.slice(0, 100) + '...[STORED_IN_INDEXEDDB]' : l.dataUrl,
        }));
        localStorage.setItem(LS_KEYS.LAYOUTS, JSON.stringify(lightLayouts));
      } catch (e) {}
    }
  },

  async getLayouts(): Promise<ProductionLineLayout[]> {
    // Try IndexedDB first
    try {
      const idbLayouts = await idbGetAll<ProductionLineLayout>(STORES.LAYOUTS);
      if (idbLayouts && idbLayouts.length > 0) {
        return idbLayouts;
      }
    } catch (e) {}

    // Fallback to localStorage
    try {
      const lsRaw = localStorage.getItem(LS_KEYS.LAYOUTS);
      if (lsRaw) {
        const parsed = JSON.parse(lsRaw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {}

    return [];
  },

  // 2. Active Stations and Machine Dimensions
  async saveStations(stations: FloorStation[]): Promise<void> {
    if (!stations || stations.length === 0) return;

    // Save to IndexedDB
    await idbPut(STORES.STATIONS, { key: 'current_stations', data: stations, updatedAt: new Date().toISOString() });

    // Save to LocalStorage
    try {
      localStorage.setItem(LS_KEYS.STATIONS, JSON.stringify(stations));
    } catch (e) {
      console.warn('Failed to save stations to localStorage:', e);
    }
  },

  async getStations(): Promise<FloorStation[] | null> {
    // Check IndexedDB
    const record = await idbGet<{ key: string; data: FloorStation[] }>(STORES.STATIONS, 'current_stations');
    if (record && Array.isArray(record.data) && record.data.length > 0) {
      return record.data;
    }

    // Check LocalStorage
    try {
      const raw = localStorage.getItem(LS_KEYS.STATIONS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {}

    return null;
  },

  // 3. Canvas Config & Dimension Display Flags
  async saveConfig(config: Record<string, any>): Promise<void> {
    await idbPut(STORES.CONFIG, { key: 'current_config', data: config, updatedAt: new Date().toISOString() });
    try {
      localStorage.setItem(LS_KEYS.CONFIG, JSON.stringify(config));
    } catch (e) {}
  },

  async getConfig(): Promise<Record<string, any> | null> {
    const record = await idbGet<{ key: string; data: Record<string, any> }>(STORES.CONFIG, 'current_config');
    if (record && record.data) {
      return record.data;
    }

    try {
      const raw = localStorage.getItem(LS_KEYS.CONFIG);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {}

    return null;
  },

  // 4. Persistent History Log (Append-Only)
  async appendHistoryLog(entry: {
    type: HistoryActionType;
    title: string;
    description: string;
    stationCount?: number;
    stationCode?: string;
    details?: Record<string, any>;
    snapshotId?: string;
  }): Promise<HistoryLogEntry> {
    const now = new Date();
    const newEntry: HistoryLogEntry = {
      id: `log-${now.getTime()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: now.toISOString(),
      formattedTime: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      ...entry,
    };

    // Save to IndexedDB
    await idbPut(STORES.HISTORY, newEntry);

    // Also maintain in localStorage (up to last 50 entries)
    try {
      const existingLogs = await this.getHistoryLog();
      const updatedLogs = [newEntry, ...existingLogs.filter((l) => l.id !== newEntry.id)].slice(0, 50);
      localStorage.setItem(LS_KEYS.HISTORY, JSON.stringify(updatedLogs));
    } catch (e) {}

    return newEntry;
  },

  async getHistoryLog(): Promise<HistoryLogEntry[]> {
    try {
      const logs = await idbGetAll<HistoryLogEntry>(STORES.HISTORY);
      if (logs && logs.length > 0) {
        return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      }
    } catch (e) {}

    try {
      const raw = localStorage.getItem(LS_KEYS.HISTORY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {}

    return [];
  },

  async clearHistoryLog(): Promise<void> {
    await idbClear(STORES.HISTORY);
    try {
      localStorage.removeItem(LS_KEYS.HISTORY);
    } catch (e) {}
  },

  // 5. Presets (Full Snapshot of Layout + Stations + Config)
  async savePreset(name: string, stations: FloorStation[], config: any, imageUrl?: string): Promise<string> {
    const now = new Date();
    const id = `preset-${now.getTime()}`;
    const preset = {
      id,
      name: name.trim() || `Layout Preset (${now.toLocaleDateString()})`,
      createdAt: now.toISOString(),
      formattedTime: now.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      stationCount: stations.length,
      stations,
      config,
      imageUrl,
    };

    await idbPut(STORES.PRESETS, preset);

    try {
      const existing = await this.getPresets();
      const updated = [preset, ...existing.filter((p) => p.id !== id)].slice(0, 20);
      localStorage.setItem(LS_KEYS.PRESETS, JSON.stringify(updated));
    } catch (e) {}

    // Record in History Log
    await this.appendHistoryLog({
      type: 'save_preset',
      title: `Saved Preset: "${preset.name}"`,
      description: `Preserved complete layout state with ${stations.length} machine stations and dimension settings.`,
      stationCount: stations.length,
    });

    return id;
  },

  async getPresets(): Promise<any[]> {
    try {
      const presets = await idbGetAll<any>(STORES.PRESETS);
      if (presets && presets.length > 0) {
        return presets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
    } catch (e) {}

    try {
      const raw = localStorage.getItem(LS_KEYS.PRESETS);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {}

    return [];
  },

  async deletePreset(id: string): Promise<void> {
    await idbDelete(STORES.PRESETS, id);
    try {
      const existing = await this.getPresets();
      const filtered = existing.filter((p) => p.id !== id);
      localStorage.setItem(LS_KEYS.PRESETS, JSON.stringify(filtered));
    } catch (e) {}
  },

  // 6. Reset & Clear Helpers
  async clearAllCadData(): Promise<void> {
    await idbClear(STORES.STATIONS);
    await idbClear(STORES.CONFIG);
    try {
      localStorage.removeItem(LS_KEYS.STATIONS);
      localStorage.removeItem(LS_KEYS.CONFIG);
    } catch (e) {}
  },
};
