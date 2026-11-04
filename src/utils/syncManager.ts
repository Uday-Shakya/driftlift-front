// driftlift-front/src/utils/syncManager.ts
// Intelligent offline replay & background sync orchestrator for DriftLift PWA

import { getSyncQueue, removeQueueItem, updateQueueItemStatus, SyncQueueItem } from './offlineDb';

export interface SyncStatus {
  isOnline: boolean;
  pendingCount: number;
  isSyncing: boolean;
  lastSyncTime: number | null;
  lastError: string | null;
}

type SyncListener = (status: SyncStatus) => void;

class SyncManager {
  private listeners: Set<SyncListener> = new Set();
  private isSyncing = false;
  private lastSyncTime: number | null = null;
  private lastError: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      // Network connectivity events
      window.addEventListener('online', () => {
        this.notify();
        this.processSyncQueue();
      });

      window.addEventListener('offline', () => {
        this.notify();
      });

      // Local storage / IndexedDB queue changes
      window.addEventListener('driftlift:queue-updated', () => {
        this.notify();
      });

      // Service worker postMessage bridge
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data && event.data.type === 'DRIFTLIFT_TRIGGER_SYNC') {
            this.processSyncQueue();
          }
        });
      }
    }
  }

  public subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    this.getStatus().then((status) => listener(status));
    return () => {
      this.listeners.delete(listener);
    };
  }

  public async getStatus(): Promise<SyncStatus> {
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    let pendingCount = 0;
    try {
      const queue = await getSyncQueue();
      pendingCount = queue.length;
    } catch {
      // IDB unavailable
    }

    return {
      isOnline,
      pendingCount,
      isSyncing: this.isSyncing,
      lastSyncTime: this.lastSyncTime,
      lastError: this.lastError
    };
  }

  private async notify() {
    const status = await this.getStatus();
    this.listeners.forEach((listener) => listener(status));
  }

  public async processSyncQueue(): Promise<{ synced: number; failed: number }> {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return { synced: 0, failed: 0 };
    }

    if (this.isSyncing) {
      return { synced: 0, failed: 0 };
    }

    this.isSyncing = true;
    this.lastError = null;
    await this.notify();

    let syncedCount = 0;
    let failedCount = 0;

    try {
      const queue: SyncQueueItem[] = await getSyncQueue();
      if (queue.length === 0) {
        this.isSyncing = false;
        await this.notify();
        return { synced: 0, failed: 0 };
      }

      const backendBase = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:8000';

      for (const item of queue) {
        await updateQueueItemStatus(item.id, 'syncing');

        try {
          const res = await fetch(`${backendBase}${item.endpoint}`, {
            method: item.method,
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(item.payload),
            credentials: 'include'
          });

          if (res.ok) {
            await removeQueueItem(item.id);
            syncedCount++;
          } else {
            const errData = await res.json().catch(() => ({}));
            const msg = errData.message || `Server responded with ${res.status}`;
            await updateQueueItemStatus(item.id, 'failed', msg);
            failedCount++;
          }
        } catch (netErr: unknown) {
          const err = netErr as Error;
          await updateQueueItemStatus(item.id, 'failed', err.message || 'Network error');
          failedCount++;
          // If network connection dropped mid-loop, break early
          if (typeof navigator !== 'undefined' && !navigator.onLine) {
            break;
          }
        }
      }

      this.lastSyncTime = Date.now();
    } catch (err: unknown) {
      const error = err as Error;
      this.lastError = error.message;
    } finally {
      this.isSyncing = false;
      await this.notify();
    }

    return { synced: syncedCount, failed: failedCount };
  }

  // Register modern Service Worker
  public registerServiceWorker(): void {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    // Only register in production or when explicitly testing
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[PWA] Service Worker registered. Scope:', reg.scope);

          // Check if Background Sync API is supported
          if ('sync' in reg) {
            const regWithSync = reg as unknown as { sync: { register: (tag: string) => Promise<void> } };
            regWithSync.sync.register('driftlift-sync').catch(() => {});
          }
        })
        .catch((err) => {
          console.warn('[PWA] Service Worker registration skipped:', err.message);
        });
    });
  }
}

export const syncManager = new SyncManager();

