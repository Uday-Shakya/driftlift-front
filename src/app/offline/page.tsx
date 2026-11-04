'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  saveOfflineWorkout,
  getOfflineWorkouts,
  getSyncQueue,
  removeQueueItem,
  OfflineWorkout,
  SyncQueueItem,
  saveOfflineMetric,
} from '@/utils/offlineDb';
import { syncManager, SyncStatus } from '@/utils/syncManager';
import { toast } from 'react-toastify';
import './offline.css';

// Pre-cached offline routines for basement gyms
const PRESET_ROUTINES = [
  {
    name: 'Basement Beast (Heavy Push)',
    muscle: 'Chest & Shoulders',
    sets: [
      { setNumber: 1, weight: 80, reps: 10, rpe: 8 },
      { setNumber: 2, weight: 85, reps: 8, rpe: 8.5 },
      { setNumber: 3, weight: 90, reps: 6, rpe: 9 },
      { setNumber: 4, weight: 80, reps: 10, rpe: 9 },
    ],
  },
  {
    name: 'Basement Pull & Deadlift',
    muscle: 'Back & Biceps',
    sets: [
      { setNumber: 1, weight: 100, reps: 8, rpe: 8 },
      { setNumber: 2, weight: 110, reps: 6, rpe: 8.5 },
      { setNumber: 3, weight: 120, reps: 5, rpe: 9.5 },
    ],
  },
  {
    name: 'Iron Leg Day (Squats & Split)',
    muscle: 'Quads & Hamstrings',
    sets: [
      { setNumber: 1, weight: 90, reps: 10, rpe: 8 },
      { setNumber: 2, weight: 100, reps: 8, rpe: 8.5 },
      { setNumber: 3, weight: 105, reps: 8, rpe: 9 },
    ],
  },
];

export default function OfflinePage() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: true,
    pendingCount: 0,
    isSyncing: false,
    lastSyncTime: null,
    lastError: null,
  });

  const [queueItems, setQueueItems] = useState<SyncQueueItem[]>([]);
  const [savedWorkouts, setSavedWorkouts] = useState<OfflineWorkout[]>([]);

  // Current Workout Builder State
  const [workoutName, setWorkoutName] = useState<string>('Heavy Bench Press');
  const [muscleGroup, setMuscleGroup] = useState<string>('Chest');
  const [durationMinutes, setDurationMinutes] = useState<number>(45);
  const [sets, setSets] = useState<Array<{ setNumber: number; weight: number; reps: number; rpe: number }>>([
    { setNumber: 1, weight: 80, reps: 10, rpe: 8 },
    { setNumber: 2, weight: 85, reps: 8, rpe: 8.5 },
    { setNumber: 3, weight: 90, reps: 6, rpe: 9 },
  ]);

  // Offline Rest Timer State
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [timerActive, setTimerActive] = useState<boolean>(false);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Load IndexedDB data & subscribe to sync manager
  const refreshData = async () => {
    try {
      const q = await getSyncQueue();
      setQueueItems(q);
      const w = await getOfflineWorkouts();
      setSavedWorkouts(w);
    } catch {
      // IDB unavailable
    }
  };

  useEffect(() => {
    const unsub = syncManager.subscribe((status) => {
      setSyncStatus(status);
      refreshData();
    });

    refreshData();

    return () => {
      unsub();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  // Audio synthesize chime for timer
  const playOfflineChime = () => {
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;
      [440, 554.37, 659.25, 880].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.18, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.4);
      });
    } catch {
      // AudioContext unavailable
    }
  };

  // Timer handlers
  const startTimer = (secs: number) => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setTimerSeconds(secs);
    setTimerActive(true);

    timerIntervalRef.current = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
          setTimerActive(false);
          playOfflineChime();
          toast.success('⏱️ Rest interval complete! Next set ready.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setTimerActive(false);
    setTimerSeconds(0);
  };

  // Set builder handlers
  const handleAddSet = () => {
    const lastSet = sets[sets.length - 1];
    setSets((prev) => [
      ...prev,
      {
        setNumber: prev.length + 1,
        weight: lastSet ? lastSet.weight : 60,
        reps: lastSet ? lastSet.reps : 10,
        rpe: lastSet ? lastSet.rpe : 8,
      },
    ]);
  };

  const handleRemoveSet = (index: number) => {
    setSets((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateSet = (index: number, field: 'weight' | 'reps' | 'rpe', val: number) => {
    setSets((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: val } : s))
    );
  };

  // Save workout offline
  const handleSaveWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workoutName.trim() || sets.length === 0) {
      toast.warning('Please enter workout name and at least 1 set.');
      return;
    }

    try {
      await saveOfflineWorkout({
        name: workoutName,
        muscleGroup,
        sets,
        durationMinutes,
        date: new Date().toISOString(),
      });

      toast.success('💾 Workout saved to IndexedDB & queued for cloud sync!');
      refreshData();
      startTimer(90);
    } catch (err: unknown) {
      const error = err as Error;
      toast.error('Failed to save offline: ' + error.message);
    }
  };

  // Quick log metric offline
  const handleQuickWater = async () => {
    try {
      await saveOfflineMetric(
        'water',
        'Hydration Intake',
        500,
        'mL',
        '/watertrack/addwaterentry',
        { water: 500, date: new Date().toISOString() }
      );
      toast.success('💧 500 mL water intake logged & queued!');
      refreshData();
    } catch (err: unknown) {
      const error = err as Error;
      toast.error('Failed to log water: ' + error.message);
    }
  };

  // Manual Trigger Cloud Sync
  const handleManualSync = async () => {
    toast.info('🔄 Initiating cloud synchronization...');
    const result = await syncManager.processSyncQueue();
    if (result.synced > 0) {
      toast.success(`✅ Successfully synced ${result.synced} item(s) to cloud!`);
    } else if (result.failed > 0) {
      toast.error(`⚠️ Failed to sync ${result.failed} item(s). Will retry automatically.`);
    } else {
      toast.info('All items already synced.');
    }
    refreshData();
  };

  // Delete individual queued item
  const handleDeleteQueue = async (id: string) => {
    await removeQueueItem(id);
    refreshData();
  };

  // Load preset routine
  const handleLoadPreset = (routine: typeof PRESET_ROUTINES[0]) => {
    setWorkoutName(routine.name);
    setMuscleGroup(routine.muscle);
    setSets(routine.sets);
    toast.info(`Loaded routine: ${routine.name}`);
  };

  const formatTimer = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="offline-page-container">
      <div className="offline-wrapper">
        {/* Header */}
        <div className="offline-header">
          <div className="offline-title-area">
            <h1>
              <span>📴</span> Offline Gym Hub
            </h1>
            <p className="offline-subtitle">
              Train freely in cellular dead zones, basement gym vaults, or airplane mode.
              All sets, workouts, and biometrics are preserved in browser IndexedDB and automatically replayed to the cloud once reconnected.
            </p>
          </div>

          <div className="offline-status-cluster">
            <div
              className={`offline-state-pill ${
                syncStatus.isOnline ? 'is-online' : 'is-offline'
              }`}
            >
              <span
                className={
                  syncStatus.isOnline ? 'state-dot-online' : 'state-dot-offline'
                }
              />
              <span>
                {syncStatus.isOnline
                  ? 'Cloud Synced (Online)'
                  : 'Basement Mode (Offline)'}
              </span>
            </div>

            <Link href="/" className="btn-add-set" style={{ textDecoration: 'none' }}>
              ← Dashboard
            </Link>
          </div>
        </div>

        {/* Main Grid */}
        <div className="offline-main-grid">
          {/* Left Column: Workout Builder & Vault */}
          <div>
            {/* Workout Logger Card */}
            <div className="offline-card">
              <div className="offline-card-header">
                <div className="offline-card-title">
                  <span>🏋️</span> Offline Workout Logger
                </div>
                <span style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 600 }}>
                  IndexedDB Engine
                </span>
              </div>

              <form onSubmit={handleSaveWorkout}>
                <div className="workout-meta-row">
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.35rem' }}>
                      Exercise / Workout Routine Name
                    </label>
                    <input
                      type="text"
                      className="offline-input"
                      value={workoutName}
                      onChange={(e) => setWorkoutName(e.target.value)}
                      placeholder="e.g., Heavy Barbell Squats"
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.35rem' }}>
                      Muscle Group
                    </label>
                    <input
                      type="text"
                      className="offline-input"
                      value={muscleGroup}
                      onChange={(e) => setMuscleGroup(e.target.value)}
                      placeholder="e.g., Chest, Legs, Back"
                    />
                  </div>
                </div>

                {/* Sets Table */}
                <table className="sets-table">
                  <thead>
                    <tr>
                      <th style={{ width: '70px' }}>Set #</th>
                      <th>Weight (kg)</th>
                      <th>Reps</th>
                      <th>RPE (1-10)</th>
                      <th style={{ width: '40px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {sets.map((s, idx) => (
                      <tr key={idx}>
                        <td>
                          <span className="set-num-badge">Set {idx + 1}</span>
                        </td>
                        <td>
                          <input
                            type="number"
                            className="offline-input"
                            value={s.weight}
                            onChange={(e) => handleUpdateSet(idx, 'weight', Number(e.target.value))}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            className="offline-input"
                            value={s.reps}
                            onChange={(e) => handleUpdateSet(idx, 'reps', Number(e.target.value))}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            step="0.5"
                            className="offline-input"
                            value={s.rpe}
                            onChange={(e) => handleUpdateSet(idx, 'rpe', Number(e.target.value))}
                          />
                        </td>
                        <td>
                          {sets.length > 1 && (
                            <button
                              type="button"
                              className="btn-remove-set"
                              onClick={() => handleRemoveSet(idx)}
                              title="Delete set"
                            >
                              ×
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Actions */}
                <div className="workout-actions-row">
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      className="btn-add-set"
                      onClick={handleAddSet}
                    >
                      + Add Set
                    </button>
                    <button
                      type="button"
                      className="btn-add-set"
                      onClick={handleQuickWater}
                      title="Quick log 500mL water"
                    >
                      💧 +500mL Water
                    </button>
                  </div>

                  <button type="submit" className="btn-save-workout">
                    Save Offline & Sync Later ⚡
                  </button>
                </div>
              </form>
            </div>

            {/* Pre-Cached Offline Routine Vault */}
            <div className="offline-card">
              <div className="offline-card-header">
                <div className="offline-card-title">
                  <span>📦</span> Pre-Cached Basement Routines
                </div>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                  No network required
                </span>
              </div>

              {PRESET_ROUTINES.map((routine, idx) => (
                <div key={idx} className="routine-card-item">
                  <div>
                    <div className="routine-title">{routine.name}</div>
                    <div className="routine-tag">
                      {routine.muscle} · {routine.sets.length} preset sets
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-load-routine"
                    onClick={() => handleLoadPreset(routine)}
                  >
                    Load into Logger →
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Offline Timer & Central Sync Queue */}
          <div>
            {/* Offline Rest Timer */}
            <div className="offline-timer-box">
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Offline Synthesizer Timer
              </div>
              <div className="timer-digits-offline">
                {timerActive ? formatTimer(timerSeconds) : '0:00'}
              </div>

              {timerActive ? (
                <button
                  type="button"
                  className="btn-add-set"
                  onClick={stopTimer}
                  style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                >
                  Stop Timer
                </button>
              ) : (
                <div className="timer-chips-row">
                  <button type="button" className="btn-timer-chip" onClick={() => startTimer(45)}>
                    45s
                  </button>
                  <button type="button" className="btn-timer-chip" onClick={() => startTimer(60)}>
                    60s
                  </button>
                  <button type="button" className="btn-timer-chip" onClick={() => startTimer(90)}>
                    90s
                  </button>
                  <button type="button" className="btn-timer-chip" onClick={() => startTimer(120)}>
                    120s
                  </button>
                </div>
              )}
            </div>

            {/* Central Cloud Sync Queue */}
            <div className="sync-queue-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#ffffff' }}>
                  Cloud Sync Queue ({queueItems.length})
                </span>
                <span style={{ fontSize: '0.75rem', color: '#10b981' }}>
                  IndexedDB
                </span>
              </div>

              <p style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.4 }}>
                Actions queued while in dead zones. Automatically replayed when internet connectivity is detected.
              </p>

              <div className="queue-items-list">
                {queueItems.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#64748b', fontSize: '0.82rem' }}>
                    ✨ Queue is empty. All offline metrics are synced to the cloud!
                  </div>
                ) : (
                  queueItems.map((item) => (
                    <div key={item.id} className="queue-item-box">
                      <div className="queue-item-left">
                        <span className="queue-item-label">{item.label}</span>
                        <span className="queue-item-time">
                          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {item.endpoint}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span className={`queue-status-tag ${item.status}`}>
                          {item.status}
                        </span>
                        <button
                          type="button"
                          className="btn-remove-set"
                          onClick={() => handleDeleteQueue(item.id)}
                          title="Discard item"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {queueItems.length > 0 && (
                <button
                  type="button"
                  className="btn-trigger-all-sync"
                  onClick={handleManualSync}
                  disabled={syncStatus.isSyncing}
                >
                  {syncStatus.isSyncing ? 'Syncing...' : 'Sync All to Cloud Now 🔄'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

