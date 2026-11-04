'use client';

import React, { useEffect, useState, createContext, useContext } from 'react';
import Link from 'next/link';
import { syncManager, SyncStatus } from '@/utils/syncManager';
import './PWA.css';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAContextType {
  syncStatus: SyncStatus;
  triggerSync: () => Promise<{ synced: number; failed: number }>;
  isInstallable: boolean;
  installApp: () => Promise<void>;
}

const PWAContext = createContext<PWAContextType | null>(null);

export const usePWA = () => {
  const ctx = useContext(PWAContext);
  if (!ctx) {
    throw new Error('usePWA must be used within a PWAProvider');
  }
  return ctx;
};

export default function PWAProvider({ children }: { children: React.ReactNode }) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: true,
    pendingCount: 0,
    isSyncing: false,
    lastSyncTime: null,
    lastError: null,
  });

  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [dismissedInstall, setDismissedInstall] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker
    syncManager.registerServiceWorker();

    // 2. Subscribe to sync manager state
    const unsubscribe = syncManager.subscribe((status) => {
      setSyncStatus(status);
    });

    // 3. Listen for PWA installation prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      if (!sessionStorage.getItem('driftlift_pwa_dismissed')) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Initial sync check if already online with queued items
    if (navigator.onLine) {
      syncManager.processSyncQueue();
    }

    return () => {
      unsubscribe();
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const triggerSync = async () => {
    return syncManager.processSyncQueue();
  };

  const installApp = async () => {
    if (!installPrompt) return;
    try {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setShowInstallBanner(false);
      }
    } catch {
      // Ignored
    } finally {
      setInstallPrompt(null);
    }
  };

  const dismissInstall = () => {
    setShowInstallBanner(false);
    setDismissedInstall(true);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('driftlift_pwa_dismissed', '1');
    }
  };

  const isOffline = !syncStatus.isOnline;
  const hasQueued = syncStatus.pendingCount > 0;

  return (
    <PWAContext.Provider
      value={{
        syncStatus,
        triggerSync,
        isInstallable: !!installPrompt && !dismissedInstall,
        installApp,
      }}
    >
      {children}

      {/* Floating Status & Install Banner HUD */}
      <div className="pwa-floating-bar">
        {/* Offline Pill Alert */}
        {isOffline && (
          <div className="pwa-pill offline">
            <div className="pwa-pill-info">
              <span className="pwa-pill-icon">📴</span>
              <span>
                <strong>Offline Mode</strong> · Gym basement mode active
              </span>
            </div>
            <Link href="/offline" className="pwa-sync-btn">
              Offline Hub →
            </Link>
          </div>
        )}

        {/* Syncing Activity Pill */}
        {syncStatus.isSyncing && (
          <div className="pwa-pill syncing">
            <div className="pwa-pill-info">
              <span className="pwa-pill-icon">🔄</span>
              <span>Syncing queued metrics with server...</span>
            </div>
          </div>
        )}

        {/* Pending Items in Queue Alert */}
        {!isOffline && !syncStatus.isSyncing && hasQueued && (
          <div className="pwa-pill queued">
            <div className="pwa-pill-info">
              <span className="pwa-pill-icon">⚡</span>
              <span>
                <strong>{syncStatus.pendingCount}</strong> item{syncStatus.pendingCount > 1 ? 's' : ''} ready to sync
              </span>
            </div>
            <button className="pwa-sync-btn" onClick={() => triggerSync()}>
              Sync Now
            </button>
          </div>
        )}

        {/* Install DriftLift PWA Banner */}
        {showInstallBanner && installPrompt && (
          <div className="pwa-install-banner">
            <div className="pwa-install-left">
              <div className="pwa-install-icon">📱</div>
              <div>
                <div className="pwa-install-title">Install DriftLift</div>
                <div className="pwa-install-sub">Offline workouts, home screen & zero lag</div>
              </div>
            </div>
            <div className="pwa-install-actions">
              <button className="btn-pwa-install" onClick={installApp}>
                Install
              </button>
              <button className="btn-pwa-dismiss" onClick={dismissInstall} title="Dismiss">
                ×
              </button>
            </div>
          </div>
        )}
      </div>
    </PWAContext.Provider>
  );
}
