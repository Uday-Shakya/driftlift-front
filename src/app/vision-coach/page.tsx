'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import {
  IoFlameOutline,
  IoPlayOutline,
  IoPauseOutline,
  IoRefreshOutline,
  IoVolumeHighOutline,
  IoVolumeMuteOutline,
  IoCameraOutline,
  IoSparkles,
  IoCheckmarkCircle,
  IoWarningOutline,
  IoTimerOutline,
  IoArrowForward,
  IoFitnessOutline
} from 'react-icons/io5'
import { EXERCISE_CONFIGS, ExerciseType } from './VisionEngine'
import './vision.css'
import { toast } from 'react-toastify'

// Dynamically import VisionEngine with SSR disabled
const VisionEngine = dynamic(() => import('./VisionEngine'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '480px',
        color: '#94a3b8',
        gap: '1rem',
        background: '#06070a',
        borderRadius: '24px',
      }}
    >
      <div
        style={{
          width: '42px',
          height: '42px',
          border: '3px solid rgba(6, 182, 212, 0.2)',
          borderTopColor: '#06b6d4',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}
      />
      <span>Loading MediaPipe AI Vision Pipeline...</span>
    </div>
  ),
})

export default function VisionCoachPage() {
  const [selectedExercise, setSelectedExercise] = useState<ExerciseType>('squat')
  const [isTracking, setIsTracking] = useState<boolean>(true)
  const [useSimulator, setUseSimulator] = useState<boolean>(true) // default to simulator so it works out of the box!
  const [isVoiceEnabled, setIsVoiceEnabled] = useState<boolean>(true)
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(true)

  // Real-time tracking telemetry
  const [reps, setReps] = useState<number>(0)
  const [formScore, setFormScore] = useState<number>(100)
  const [currentAngle, setCurrentAngle] = useState<number>(180)
  const [diagnostic, setDiagnostic] = useState<{ message: string; isAlert: boolean }>({
    message: 'Align yourself in frame to start tracking...',
    isAlert: false,
  })
  const [repPulse, setRepPulse] = useState<boolean>(false)

  // Set Timer
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Rest Timer Modal
  const [showRestModal, setShowRestModal] = useState<boolean>(false)
  const [restSecondsLeft, setRestSecondsLeft] = useState<number>(60)
  const restIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const [completedSetData, setCompletedSetData] = useState<{ reps: number; score: number } | null>(null)

  const activeConfig = EXERCISE_CONFIGS[selectedExercise]

  // Track set duration timer
  useEffect(() => {
    if (isTracking && !showRestModal) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1)
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isTracking, showRestModal])

  // Rep count change handler with visual pulse
  const handleRepChange = (newCount: number) => {
    setReps(newCount)
    setRepPulse(true)
    setTimeout(() => setRepPulse(false), 300)
  }

  // Format MM:SS
  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60)
    const s = sec % 60
    return `${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  // Finish Set & Start Smart Rest Countdown
  const handleFinishSet = async () => {
    setIsTracking(false)
    setCompletedSetData({ reps, score: formScore })
    setShowRestModal(true)
    setRestSecondsLeft(60)

    toast.success(`Set finished! ${reps} reps completed with ${formScore}% form accuracy.`)

    // Attempt to log entry to backend
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:8000'
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('driftlift_token') : null
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`

      await fetch(`${backendUrl}/workouttrack/addworkoutentry`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          date: new Date(),
          exercise: `${activeConfig.name} (${reps} reps, Form: ${formScore}%)`,
          durationInMinutes: Math.max(1, Math.round(elapsedSeconds / 60)),
        }),
      })
    } catch (e) {
      // Offline fallback
    }

    // Start rest countdown
    if (restIntervalRef.current) clearInterval(restIntervalRef.current)
    restIntervalRef.current = setInterval(() => {
      setRestSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(restIntervalRef.current!)
          setShowRestModal(false)
          // Reset for next set
          setReps(0)
          setElapsedSeconds(0)
          setIsTracking(true)
          toast.info('Rest complete! Ready for next set.')
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleSkipRest = () => {
    if (restIntervalRef.current) clearInterval(restIntervalRef.current)
    setShowRestModal(false)
    setReps(0)
    setElapsedSeconds(0)
    setIsTracking(true)
  }

  const handleResetCounters = () => {
    setReps(0)
    setFormScore(100)
    setElapsedSeconds(0)
    toast.info('Set counters reset.')
  }

  return (
    <div className="vision-coach-page">
      {/* Page Header */}
      <div className="vision-header">
        <div className="vision-title-group">
          <div className="badge-glow" style={{ width: 'fit-content', marginBottom: '0.4rem' }}>
            <IoSparkles /> AI Biomechanics Engine
          </div>
          <h1>COMPUTER VISION REP COUNTER & FORM CHECKER</h1>
          <p className="vision-subtitle">
            Harness real-time optical pose tracking to automatically count reps, detect joint angles,
            and receive live voice form correction without touching your screen.
          </p>
        </div>

        {/* Top Control Cluster */}
        <div className="vision-top-actions">
          {/* Simulator Toggle */}
          <button
            className={`mode-toggle-btn ${useSimulator ? 'active' : ''}`}
            onClick={() => {
              setUseSimulator(!useSimulator)
              toast.info(
                !useSimulator
                  ? 'Switched to Kinetic Simulator Demo Mode'
                  : 'Switched to Live Camera Mode (Ensure camera permission is granted)'
              )
            }}
          >
            <IoCameraOutline size={18} />
            <span>{useSimulator ? 'Simulator Demo Active' : 'Live Camera Active'}</span>
          </button>

          {/* Voice Coach Toggle */}
          <button
            className={`icon-circle-btn ${!isVoiceEnabled ? 'muted' : ''}`}
            onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
            title={isVoiceEnabled ? 'Mute AI Voice Coach' : 'Enable AI Voice Coach'}
          >
            {isVoiceEnabled ? <IoVolumeHighOutline size={20} /> : <IoVolumeMuteOutline size={20} />}
          </button>
        </div>
      </div>

      {/* Exercise Selection Bar */}
      <div className="exercise-selector-bar">
        {(Object.keys(EXERCISE_CONFIGS) as ExerciseType[]).map((key) => {
          const cfg = EXERCISE_CONFIGS[key]
          return (
            <button
              key={key}
              className={`exercise-pill-btn ${selectedExercise === key ? 'active' : ''}`}
              onClick={() => {
                setSelectedExercise(key)
                handleResetCounters()
              }}
            >
              {cfg.name}
            </button>
          )
        })}
      </div>

      {/* Main Workspace Grid */}
      <div className="vision-workspace-grid">
        {/* Left: Viewport Card */}
        <div className="vision-viewport-card">
          <VisionEngine
            exercise={selectedExercise}
            isTracking={isTracking}
            useSimulator={useSimulator}
            isVoiceEnabled={isVoiceEnabled}
            isSoundEnabled={isSoundEnabled}
            onRepCountChange={handleRepChange}
            onFormScoreChange={(score) => setFormScore(score)}
            onDiagnosticUpdate={(msg, isAlert) => setDiagnostic({ message: msg, isAlert })}
            onCurrentAngleChange={(deg) => setCurrentAngle(deg)}
          />

          {/* Viewport Floating HUD Banner */}
          <div className="viewport-hud-banner">
            <div
              className={`diagnostic-text-box ${
                diagnostic.isAlert ? 'alert' : formScore >= 85 ? 'success' : 'neutral'
              }`}
            >
              {diagnostic.isAlert ? (
                <IoWarningOutline size={22} />
              ) : (
                <IoCheckmarkCircle size={22} />
              )}
              <span>{diagnostic.message}</span>
            </div>

            <div className="set-timer-box">
              <IoTimerOutline size={18} />
              <span>TIME: {formatTimer(elapsedSeconds)}</span>
            </div>
          </div>
        </div>

        {/* Right: Telemetry & Controls Sidebar */}
        <div className="vision-telemetry-sidebar">
          {/* Giant Rep Counter Card */}
          <div className="glass-card giant-rep-card">
            <div className="rep-counter-label">REPETITION COUNT</div>
            <div className={`rep-huge-number ${repPulse ? 'pulse' : ''}`}>{reps}</div>
            <div className="rep-target-sub">TARGET: 10 - 12 REPS (HYPERTROPHY)</div>

            <div className="set-action-row">
              {isTracking ? (
                <button
                  className="btn-pause-tracking"
                  onClick={() => setIsTracking(false)}
                >
                  <IoPauseOutline size={20} /> Pause Set
                </button>
              ) : (
                <button
                  className="btn-start-tracking"
                  onClick={() => setIsTracking(true)}
                >
                  <IoPlayOutline size={20} /> Resume Set
                </button>
              )}

              <button className="btn-finish-set" onClick={handleFinishSet}>
                <IoTimerOutline size={20} /> Finish & Rest
              </button>
            </div>
          </div>

          {/* Form Quality & Joint Angle Telemetry Card */}
          <div className="glass-card">
            <div className="telemetry-row">
              <span className="telemetry-label">Form Accuracy Index</span>
              <span
                className="telemetry-val"
                style={{
                  color: formScore >= 85 ? '#10b981' : formScore >= 70 ? '#f59e0b' : '#ef4444',
                }}
              >
                {formScore}%
              </span>
            </div>
            <div className="progress-track-small">
              <div
                className="progress-fill-small"
                style={{
                  width: `${formScore}%`,
                  background:
                    formScore >= 85 ? '#10b981' : formScore >= 70 ? '#f59e0b' : '#ef4444',
                }}
              />
            </div>

            <div style={{ margin: '1.25rem 0' }}></div>

            <div className="telemetry-row">
              <span className="telemetry-label">{activeConfig.primaryAngleName}</span>
              <span className="telemetry-val" style={{ color: '#06b6d4' }}>
                {currentAngle}°
              </span>
            </div>
            <div className="progress-track-small">
              <div
                className="progress-fill-small"
                style={{
                  width: `${Math.min(100, Math.round((currentAngle / 180) * 100))}%`,
                  background: '#06b6d4',
                }}
              />
            </div>
          </div>

          {/* Form Execution Instructions */}
          <div className="glass-card">
            <div
              style={{
                fontSize: '0.82rem',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: '#cbd5e1',
                fontWeight: 700,
                marginBottom: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <IoFitnessOutline size={18} /> Kinetic Execution Protocol
            </div>
            <ul className="instruction-list">
              {activeConfig.instructions.map((inst, i) => (
                <li key={i}>{inst}</li>
              ))}
            </ul>

            <div style={{ marginTop: '1.25rem' }}>
              <Link
                href={`/workout/${
                  selectedExercise === 'squat'
                    ? 'legs'
                    : selectedExercise === 'bicep_curl'
                    ? 'biceps'
                    : selectedExercise === 'pushup'
                    ? 'chest'
                    : 'shoulder'
                }`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  fontSize: '0.82rem',
                  color: '#06b6d4',
                  textDecoration: 'none',
                  fontWeight: 600,
                }}
              >
                Watch HD Video Tutorial for {activeConfig.name} <IoArrowForward />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Rest Countdown Modal */}
      {showRestModal && (
        <div className="rest-modal-overlay">
          <div className="rest-modal-card">
            <div className="badge-glow" style={{ margin: '0 auto 1rem auto', width: 'fit-content' }}>
              <IoFlameOutline /> REST TIMER ACTIVATED
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>
              RECOVER & CATCH YOUR BREATH
            </h2>
            <div className="rest-timer-dial">{restSecondsLeft}s</div>

            {completedSetData && (
              <>
                <div className="rest-summary-reps">
                  Completed {completedSetData.reps} Reps
                </div>
                <div className="rest-summary-score">
                  Set Form Quality: {completedSetData.score}% Clean Reps
                </div>
              </>
            )}

            <button className="btn-skip-rest" onClick={handleSkipRest}>
              Skip Rest & Begin Next Set
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
