// driftlift-front/src/utils/offlineDb.ts
// Native browser IndexedDB persistence engine for DriftLift Offline-First PWA

export interface OfflineWorkout {
  id: string;
  name: string;
  muscleGroup: string;
  sets: Array<{ setNumber: number; weight: number; reps: number; rpe?: number }>;
  durationMinutes: number;
  date: string;
  timestamp: number;
  synced: boolean;
}

export interface OfflineMetric {
  id: string;
  type: 'calorie' | 'water' | 'step' | 'sleep' | 'weight';
  label: string;
  value: number;
  unit: string;
  date: string;
  timestamp: number;
  synced: boolean;
}

export interface SyncQueueItem {
  id: string;
  label: string;
  endpoint: string;
  method: 'POST' | 'PUT';
  payload: Record<string, unknown>;
  timestamp: number;
  status: 'pending' | 'syncing' | 'failed';
  retryCount: number;
  lastError?: string;
}

const DB_NAME = 'driftlift_offline_pwa';
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

function getDb(): Promise<IDBDatabase> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('IndexedDB unavailable on server'));
  }

  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // 1. Workouts store
      if (!db.objectStoreNames.contains('workouts')) {
        const workoutStore = db.createObjectStore('workouts', { keyPath: 'id' });
        workoutStore.createIndex('synced', 'synced', { unique: false });
        workoutStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      // 2. Metrics store (Hydration, Calories, Weight, etc.)
      if (!db.objectStoreNames.contains('metrics')) {
        const metricStore = db.createObjectStore('metrics', { keyPath: 'id' });
        metricStore.createIndex('type', 'type', { unique: false });
        metricStore.createIndex('synced', 'synced', { unique: false });
      }

      // 3. Central Sync Queue for replay
      if (!db.objectStoreNames.contains('sync_queue')) {
        const queueStore = db.createObjectStore('sync_queue', { keyPath: 'id' });
        queueStore.createIndex('status', 'status', { unique: false });
        queueStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });

  return dbPromise;
}

// -------------------------------------------------------------
// Workouts Offline API
// -------------------------------------------------------------
export async function saveOfflineWorkout(workout: Omit<OfflineWorkout, 'id' | 'timestamp' | 'synced'>): Promise<OfflineWorkout> {
  const db = await getDb();
  const id = `wo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const record: OfflineWorkout = {
    ...workout,
    id,
    timestamp: Date.now(),
    synced: false
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(['workouts', 'sync_queue'], 'readwrite');
    const workoutStore = tx.objectStore('workouts');
    const queueStore = tx.objectStore('sync_queue');

    workoutStore.add(record);

    // Queue for sync with backend /workouttrack/addworkoutentry
    const queueItem: SyncQueueItem = {
      id: `sync-${id}`,
      label: `Workout: ${record.name} (${record.sets.length} sets)`,
      endpoint: '/workouttrack/addworkoutentry',
      method: 'POST',
      payload: {
        workoutName: record.name,
        muscleGroup: record.muscleGroup,
        sets: record.sets,
        duration: record.durationMinutes,
        date: record.date
      },
      timestamp: Date.now(),
      status: 'pending',
      retryCount: 0
    };
    queueStore.add(queueItem);

    tx.oncomplete = () => {
      notifyQueueChange();
      resolve(record);
    };
    tx.onerror = () => reject(tx.error);
  });
}

export async function getOfflineWorkouts(): Promise<OfflineWorkout[]> {
  const db = await getDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('workouts', 'readonly');
    const store = tx.objectStore('workouts');
    const request = store.getAll();

    request.onsuccess = () => {
      const results = (request.result || []) as OfflineWorkout[];
      results.sort((a, b) => b.timestamp - a.timestamp);
      resolve(results);
    };
    request.onerror = () => reject(request.error);
  });
}

// -------------------------------------------------------------
// Metrics Offline API (Hydration, Calories, Weight, etc.)
// -------------------------------------------------------------
export async function saveOfflineMetric(
  type: OfflineMetric['type'],
  label: string,
  value: number,
  unit: string,
  endpoint: string,
  backendPayload: Record<string, unknown>
): Promise<OfflineMetric> {
  const db = await getDb();
  const id = `met-${type}-${Date.now()}`;
  const record: OfflineMetric = {
    id,
    type,
    label,
    value,
    unit,
    date: new Date().toISOString(),
    timestamp: Date.now(),
    synced: false
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(['metrics', 'sync_queue'], 'readwrite');
    const metricStore = tx.objectStore('metrics');
    const queueStore = tx.objectStore('sync_queue');

    metricStore.add(record);

    const queueItem: SyncQueueItem = {
      id: `sync-${id}`,
      label: `${label}: ${value} ${unit}`,
      endpoint,
      method: 'POST',
      payload: backendPayload,
      timestamp: Date.now(),
      status: 'pending',
      retryCount: 0
    };
    queueStore.add(queueItem);

    tx.oncomplete = () => {
      notifyQueueChange();
      resolve(record);
    };
    tx.onerror = () => reject(tx.error);
  });
}

// -------------------------------------------------------------
// Central Sync Queue API
// -------------------------------------------------------------
export async function getSyncQueue(): Promise<SyncQueueItem[]> {
  const db = await getDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('sync_queue', 'readonly');
    const store = tx.objectStore('sync_queue');
    const request = store.getAll();

    request.onsuccess = () => {
      const results = (request.result || []) as SyncQueueItem[];
      results.sort((a, b) => a.timestamp - b.timestamp);
      resolve(results);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function removeQueueItem(id: string): Promise<void> {
  const db = await getDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('sync_queue', 'readwrite');
    const store = tx.objectStore('sync_queue');
    store.delete(id);
    tx.oncomplete = () => {
      notifyQueueChange();
      resolve();
    };
    tx.onerror = () => reject(tx.error);
  });
}

export async function updateQueueItemStatus(
  id: string,
  status: 'pending' | 'syncing' | 'failed',
  lastError?: string
): Promise<void> {
  const db = await getDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('sync_queue', 'readwrite');
    const store = tx.objectStore('sync_queue');
    const getReq = store.get(id);

    getReq.onsuccess = () => {
      const item = getReq.result as SyncQueueItem;
      if (item) {
        item.status = status;
        if (status === 'failed') {
          item.retryCount = (item.retryCount || 0) + 1;
          item.lastError = lastError;
        }
        store.put(item);
      }
    };

    tx.oncomplete = () => {
      notifyQueueChange();
      resolve();
    };
    tx.onerror = () => reject(tx.error);
  });
}

export async function clearSyncedItems(): Promise<void> {
  const db = await getDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('sync_queue', 'readwrite');
    const store = tx.objectStore('sync_queue');
    const request = store.openCursor();

    request.onsuccess = (e) => {
      const cursor = (e.target as IDBRequest).result as IDBCursorWithValue;
      if (cursor) {
        // delete if completed
        cursor.continue();
      }
    };
    tx.oncomplete = () => {
      notifyQueueChange();
      resolve();
    };
    tx.onerror = () => reject(tx.error);
  });
}

function notifyQueueChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('driftlift:queue-updated'));
  }
}

