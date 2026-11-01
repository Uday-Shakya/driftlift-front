'use client'

import React, { useState, useEffect, useMemo } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import {
  IoFlameOutline,
  IoSyncOutline,
  IoArrowForward,
  IoSparkles,
  IoRefreshOutline,
  IoEyeOutline,
  IoFitnessOutline,
  IoInformationCircleOutline,
  IoCheckmarkCircle
} from 'react-icons/io5'
import {
  MUSCLE_REGISTRY,
  getFatigueColorHex,
  getFatigueLevelLabel,
  MuscleInfo
} from './HeatmapCanvas'
import './heatmap.css'
import { toast } from 'react-toastify'

// Dynamically import Three.js canvas to disable SSR
const HeatmapCanvas = dynamic(() => import('./HeatmapCanvas'), {
  ssr: false,
  loading: () => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      color: '#94a3b8',
      gap: '1rem',
      background: 'rgba(8, 9, 14, 0.9)'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '3px solid rgba(6, 182, 212, 0.2)',
        borderTopColor: '#06b6d4',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      <span>Initializing 3D Biometric Engine...</span>
    </div>
  ),
})

const INITIAL_FATIGUES: Record<string, number> = {
  chest: 82,
  abs: 45,
  obliques: 30,
  shoulders: 70,
  biceps: 58,
  triceps: 65,
  forearms: 25,
  back_traps: 40,
  back_lats: 88,
  back_lower: 50,
  glutes: 60,
  quads: 92,
  hamstrings: 78,
  calves: 35,
}

export default function MuscleHeatmapPage() {
  const [fatigueLevels, setFatigueLevels] = useState<Record<string, number>>(INITIAL_FATIGUES)
  const [selectedMuscleKey, setSelectedMuscleKey] = useState<string>('chest')
  const [cameraPreset, setCameraPreset] = useState<'front' | 'back' | 'iso' | 'upper' | 'lower' | null>('front')
  const [isAutoRotate, setIsAutoRotate] = useState<boolean>(false)
  const [syncingWorkouts, setSyncingWorkouts] = useState<boolean>(false)

  const selectedMuscle: MuscleInfo = MUSCLE_REGISTRY[selectedMuscleKey] || MUSCLE_REGISTRY.chest
  const currentFatigue = fatigueLevels[selectedMuscleKey] ?? selectedMuscle.defaultFatigue
  const fatigueStatus = getFatigueLevelLabel(currentFatigue)

  // Calculate Overall Body Readiness Score (100% - average fatigue)
  const readinessIndex = useMemo(() => {
    const keys = Object.keys(fatigueLevels)
    if (keys.length === 0) return 75
    const totalFatigue = keys.reduce((acc, k) => acc + (fatigueLevels[k] || 0), 0)
    const avgFatigue = totalFatigue / keys.length
    return Math.max(10, Math.min(100, Math.round(100 - avgFatigue)))
  }, [fatigueLevels])

  const readinessColor = useMemo(() => {
    if (readinessIndex >= 70) return '#10b981' // Green
    if (readinessIndex >= 50) return '#06b6d4' // Cyan
    if (readinessIndex >= 35) return '#f59e0b' // Amber
    return '#ef4444' // Red
  }, [readinessIndex])

  // Estimated recovery hours based on current fatigue
  const recoveryEtaHours = useMemo(() => {
    if (currentFatigue <= 25) return 0
    if (currentFatigue <= 50) return 12
    if (currentFatigue <= 70) return 24
    if (currentFatigue <= 85) return 36
    return 48
  }, [currentFatigue])

  // Preset Handlers
  const handleApplyPreset = (presetName: string) => {
    if (presetName === 'push') {
      setFatigueLevels({
        ...fatigueLevels,
        chest: 92,
        shoulders: 86,
        triceps: 82,
        abs: 30,
        quads: 20,
        hamstrings: 15,
        glutes: 20,
        back_lats: 30,
      })
      setSelectedMuscleKey('chest')
      setCameraPreset('front')
      toast.info('Applied "Push Day Burnout" fatigue state')
    } else if (presetName === 'pull') {
      setFatigueLevels({
        ...fatigueLevels,
        back_lats: 94,
        back_traps: 84,
        back_lower: 65,
        biceps: 88,
        forearms: 72,
        chest: 25,
        quads: 20,
      })
      setSelectedMuscleKey('back_lats')
      setCameraPreset('back')
      toast.info('Applied "Pull Day Destruction" fatigue state')
    } else if (presetName === 'legs') {
      setFatigueLevels({
        ...fatigueLevels,
        quads: 96,
        hamstrings: 90,
        glutes: 88,
        calves: 75,
        back_lower: 60,
        chest: 20,
        shoulders: 15,
      })
      setSelectedMuscleKey('quads')
      setCameraPreset('lower')
      toast.info('Applied "Leg Day Aftermath" fatigue state')
    } else if (presetName === 'fresh') {
      const resetMap: Record<string, number> = {}
      Object.keys(MUSCLE_REGISTRY).forEach((k) => {
        resetMap[k] = 18
      })
      setFatigueLevels(resetMap)
      toast.success('Reset: All muscles fully recovered & primed')
    }
  }

  // Handle single muscle fatigue slider adjustment
  const handleSliderChange = (newVal: number) => {
    setFatigueLevels((prev) => ({
      ...prev,
      [selectedMuscleKey]: newVal,
    }))
  }

  // Sync real workouts from backend if user is logged in
  const syncWithWorkoutLogs = async () => {
    setSyncingWorkouts(true)
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:8000'
    try {
      const res = await fetch(`${backendUrl}/workouttrack/getworkoutbylimit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ limit: 14 }),
      })
      const data = await res.json()
      if (data.ok && Array.isArray(data.data) && data.data.length > 0) {
        // Calculate dynamic fatigue based on recent logs
        const updated = { ...fatigueLevels }
        data.data.forEach((entry: any) => {
          // Check workout type/exercises
          const name = (entry.exerciseName || entry.workoutName || '').toLowerCase()
          if (name.includes('chest') || name.includes('bench') || name.includes('push')) {
            updated.chest = Math.min(100, (updated.chest || 50) + 25)
            updated.triceps = Math.min(100, (updated.triceps || 50) + 20)
          }
          if (name.includes('squat') || name.includes('leg') || name.includes('quad')) {
            updated.quads = Math.min(100, (updated.quads || 50) + 30)
            updated.glutes = Math.min(100, (updated.glutes || 50) + 25)
          }
          if (name.includes('pull') || name.includes('lat') || name.includes('row') || name.includes('back')) {
            updated.back_lats = Math.min(100, (updated.back_lats || 50) + 28)
            updated.biceps = Math.min(100, (updated.biceps || 50) + 22)
          }
        })
        setFatigueLevels(updated)
        toast.success(`Synced fatigue from ${data.data.length} logged workouts!`)
      } else {
        toast.info('No recent workout logs found. Showing simulated biometric baseline.')
      }
    } catch (err) {
      toast.info('Using simulated biometric data (Sign in to auto-sync personal workouts).')
    } finally {
      setSyncingWorkouts(false)
    }
  }

  return (
    <div className="heatmap-page-container">
      {/* Page Header */}
      <div className="heatmap-header">
        <div className="heatmap-title-group">
          <div className="badge-glow" style={{ width: 'fit-content', marginBottom: '0.4rem' }}>
            <IoSparkles /> Real-Time Biometric Heatmap
          </div>
          <h1>3D MUSCLE FATIGUE & RECOVERY SCANNER</h1>
          <p className="heatmap-subtitle">
            Rotate and inspect your kinetic anatomical model. Hover or click any muscle group
            to inspect DOMS fatigue, estimated recovery time, and optimal exercise selection.
          </p>
        </div>

        {/* Total Body Readiness Index Card */}
        <div className="readiness-score-cluster">
          <div
            className="readiness-gauge"
            style={{
              color: readinessColor,
              border: `3px solid ${readinessColor}`,
            }}
          >
            {readinessIndex}%
          </div>
          <div className="readiness-meta">
            <span className="readiness-label">Body Readiness</span>
            <span className="readiness-status">
              {readinessIndex >= 70
                ? 'Prime Condition'
                : readinessIndex >= 50
                ? 'Hypertrophy Ready'
                : 'Recovery Priority'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Interactive Grid */}
      <div className="heatmap-workspace-grid">
        {/* 3D WebGL Viewport */}
        <div className="viewport-card">
          {/* Floating Camera Controls Overlay */}
          <div className="camera-controls-overlay">
            <div className="cam-btn-group">
              <button
                className={`cam-pill-btn ${cameraPreset === 'front' ? 'active' : ''}`}
                onClick={() => setCameraPreset('front')}
              >
                Front
              </button>
              <button
                className={`cam-pill-btn ${cameraPreset === 'back' ? 'active' : ''}`}
                onClick={() => setCameraPreset('back')}
              >
                Back
              </button>
              <button
                className={`cam-pill-btn ${cameraPreset === 'upper' ? 'active' : ''}`}
                onClick={() => setCameraPreset('upper')}
              >
                Upper Body
              </button>
              <button
                className={`cam-pill-btn ${cameraPreset === 'lower' ? 'active' : ''}`}
                onClick={() => setCameraPreset('lower')}
              >
                Legs
              </button>
              <button
                className={`cam-pill-btn ${cameraPreset === 'iso' ? 'active' : ''}`}
                onClick={() => setCameraPreset('iso')}
              >
                Isometric
              </button>
            </div>

            <button
              className={`rotate-toggle-btn ${isAutoRotate ? 'active' : ''}`}
              onClick={() => setIsAutoRotate(!isAutoRotate)}
              title="Toggle cinematic auto-rotation"
            >
              <IoRefreshOutline size={16} />
              {isAutoRotate ? 'Stop Rotation' : 'Auto Rotate'}
            </button>
          </div>

          {/* 3D Canvas */}
          <HeatmapCanvas
            fatigueLevels={fatigueLevels}
            selectedMuscleKey={selectedMuscleKey}
            onSelectMuscle={(k) => setSelectedMuscleKey(k)}
            cameraPreset={cameraPreset}
            isAutoRotate={isAutoRotate}
          />

          {/* Bottom Color Heatmap Legend */}
          <div className="heatmap-legend-bar">
            <div className="legend-item">
              <span className="legend-dot" style={{ background: '#10b981', color: '#10b981' }} />
              <span>0-25% Recovered</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot" style={{ background: '#06b6d4', color: '#06b6d4' }} />
              <span>26-50% Optimal</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot" style={{ background: '#f59e0b', color: '#f59e0b' }} />
              <span>51-70% Stimulated</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot" style={{ background: '#f97316', color: '#f97316' }} />
              <span>71-85% High Fatigue</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot" style={{ background: '#ef4444', color: '#ef4444' }} />
              <span>86-100% Exhausted</span>
            </div>
          </div>
        </div>

        {/* Sidebar Intel & Controls */}
        <div className="intel-sidebar">
          {/* Active Muscle Intelligence Card */}
          <div className="glass-card muscle-detail-card">
            <div className="detail-badge-row">
              <span className="muscle-category-badge">
                {selectedMuscle.category.toUpperCase()} GROUP
              </span>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: fatigueStatus.color,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                }}
              >
                <IoFlameOutline /> {fatigueStatus.badge}
              </span>
            </div>

            <h2 className="muscle-name-title">{selectedMuscle.name}</h2>
            <p className="muscle-action-text">{selectedMuscle.primaryAction}</p>

            {/* Fatigue Meter Box */}
            <div className="fatigue-meter-box">
              <div className="fatigue-labels">
                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Fatigue Load</span>
                <span
                  className="fatigue-pct-display"
                  style={{ color: getFatigueColorHex(currentFatigue) }}
                >
                  {currentFatigue}%
                </span>
              </div>

              <div className="fatigue-bar-track">
                <div
                  className="fatigue-bar-fill"
                  style={{
                    width: `${currentFatigue}%`,
                    background: getFatigueColorHex(currentFatigue),
                    boxShadow: `0 0 10px ${getFatigueColorHex(currentFatigue)}`,
                  }}
                />
              </div>

              <div className="recovery-eta-row">
                <span>Estimated Full Recovery:</span>
                <span className="recovery-eta-val">
                  {recoveryEtaHours === 0 ? 'Fully Ready' : `~${recoveryEtaHours} Hours`}
                </span>
              </div>

              {/* Real-time Slider to Test Glowing Simulation */}
              <div className="slider-control-group">
                <label>Calibrate / Test Fatigue Level:</label>
                <input
                  type="range"
                  min="5"
                  max="100"
                  value={currentFatigue}
                  onChange={(e) => handleSliderChange(Number(e.target.value))}
                  className="fatigue-slider-input"
                />
              </div>
            </div>

            {/* Target Exercises */}
            <div className="intel-section-title">
              <IoFitnessOutline /> Top Target Exercises
            </div>
            <div className="exercise-tag-list">
              {selectedMuscle.recommendedExercises.map((ex, i) => (
                <span key={i} className="exercise-tag">
                  {ex}
                </span>
              ))}
            </div>

            {/* Recovery & Stretches */}
            <div className="intel-section-title">
              <IoCheckmarkCircle style={{ color: '#10b981' }} /> Active Recovery & Stretches
            </div>
            <ul className="stretch-list">
              {selectedMuscle.recoveryStretches.map((str, i) => (
                <li key={i}>{str}</li>
              ))}
            </ul>

            {/* Direct Workout Tutorial CTA */}
            <Link href={selectedMuscle.targetWorkoutUrl} className="view-workout-cta">
              Explore {selectedMuscle.name.split(' ')[0]} Workouts & Video Cues <IoArrowForward />
            </Link>
          </div>

          {/* Quick Workout Presets */}
          <div className="glass-card">
            <div className="intel-section-title">
              <IoSparkles style={{ color: '#f59e0b' }} /> Quick Simulation Scenarios
            </div>
            <div className="preset-button-grid">
              <button
                className="preset-btn"
                onClick={() => handleApplyPreset('push')}
              >
                <strong>🔥 Push Day</strong>
                <span>Chest, Shoulders & Triceps</span>
              </button>
              <button
                className="preset-btn"
                onClick={() => handleApplyPreset('pull')}
              >
                <strong>⚡ Pull Day</strong>
                <span>Lats, Upper Back & Biceps</span>
              </button>
              <button
                className="preset-btn"
                onClick={() => handleApplyPreset('legs')}
              >
                <strong>🦵 Leg Day</strong>
                <span>Quads, Hamstrings & Glutes</span>
              </button>
              <button
                className="preset-btn"
                onClick={() => handleApplyPreset('fresh')}
              >
                <strong>✨ Full Reset</strong>
                <span>100% Rested & Primed</span>
              </button>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <button
                onClick={syncWithWorkoutLogs}
                disabled={syncingWorkouts}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#cbd5e1',
                  padding: '0.65rem',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                }}
              >
                <IoSyncOutline
                  style={{ animation: syncingWorkouts ? 'spin 1s linear infinite' : 'none' }}
                />
                {syncingWorkouts ? 'Syncing Logs...' : 'Sync from My Recent Workout Logs'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
