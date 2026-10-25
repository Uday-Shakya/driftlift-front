'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  IoFlameOutline,
  IoTimeOutline,
  IoPlayCircleOutline,
  IoCheckmarkCircle,
  IoReloadOutline,
  IoChevronBack,
  IoInformationCircleOutline,
  IoSparkles,
  IoVolumeHighOutline,
  IoVolumeMuteOutline
} from 'react-icons/io5'
import { toast } from 'react-toastify'
import './workoutPage.css'

interface Exercise {
  name: string
  description: string
  sets: number
  reps: number
  rest: number
  videoUrl?: string
  youtubeId?: string
  imageURL?: string
  tips?: string[]
}

interface Workout {
  _id?: string
  name: string
  category: string
  description: string
  durationInMinutes: number
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  targetMuscles: string[]
  exercises: Exercise[]
  imageURL?: string
}

const CATEGORIES = [
  { key: 'chest', label: 'Chest' },
  { key: 'back', label: 'Back' },
  { key: 'abs', label: 'Abs & Core' },
  { key: 'shoulder', label: 'Shoulders' },
  { key: 'biceps', label: 'Arms' },
  { key: 'legs', label: 'Legs' },
]

const WorkoutPage = () => {
  const params = useParams()
  const router = useRouter()
  const rawType = params?.type ? (Array.isArray(params.type) ? params.type[0] : params.type) : 'chest'
  const currentCategory = rawType.toLowerCase()

  const [workout, setWorkout] = useState<Workout | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  // Interactive Live Workout Mode State
  const [isLiveMode, setIsLiveMode] = useState<boolean>(false)
  const [activeExerciseIdx, setActiveExerciseIdx] = useState<number>(0)
  const [completedSets, setCompletedSets] = useState<Record<string, number>>({})
  const [restSecondsLeft, setRestSecondsLeft] = useState<number>(0)
  const [isResting, setIsResting] = useState<boolean>(false)
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true)

  const restTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Web Audio chime for rest timer countdown
  const playChime = () => {
    if (!soundEnabled) return
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const osc = audioCtx.createOscillator()
      const gain = audioCtx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime) // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.3) // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3)
      osc.connect(gain)
      gain.connect(audioCtx.destination)
      osc.start()
      osc.stop(audioCtx.currentTime + 0.35)
    } catch (e) {
      // AudioContext fallback
    }
  }

  // Fetch workout data from backend
  const fetchWorkout = async (cat: string) => {
    setLoading(true)
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:8000'
      const res = await fetch(`${backendUrl}/workoutplans/category/${cat}`)
      const data = await res.json()

      if (data.ok && data.data && data.data.length > 0) {
        setWorkout(data.data[0])
      } else {
        // Fallback default if backend is seeding
        setWorkout({
          name: `${cat.toUpperCase()} Routine`,
          category: cat,
          description: `Comprehensive form-guided workout for ${cat}.`,
          durationInMinutes: 45,
          difficulty: 'Intermediate',
          targetMuscles: [cat],
          exercises: [
            {
              name: `${cat.toUpperCase()} Form Focus`,
              description: 'Focus on full range of motion, muscle mind connection, and steady negatives.',
              sets: 4,
              reps: 10,
              rest: 60,
              videoUrl: 'https://www.youtube.com/embed/rT7DgCr-3pg',
              tips: ['Control tempo 2 seconds down, 1 second pause, 1 second explode', 'Maintain rigid core']
            }
          ]
        })
      }
    } catch (err) {
      toast.error('Could not load online workout, loading offline guide')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWorkout(currentCategory)
  }, [currentCategory])

  // Rest Timer countdown
  useEffect(() => {
    if (isResting && restSecondsLeft > 0) {
      restTimerRef.current = setInterval(() => {
        setRestSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(restTimerRef.current as NodeJS.Timeout)
            setIsResting(false)
            playChime()
            toast.info('Rest complete! Ready for next set.')
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => {
      if (restTimerRef.current) clearInterval(restTimerRef.current)
    }
  }, [isResting, restSecondsLeft])

  const startRestTimer = (seconds: number) => {
    setIsResting(true)
    setRestSecondsLeft(seconds)
  }

  const markSetDone = (exerciseName: string, maxSets: number, restTime: number) => {
    const current = completedSets[exerciseName] || 0
    if (current < maxSets) {
      setCompletedSets({
        ...completedSets,
        [exerciseName]: current + 1
      })
      startRestTimer(restTime || 60)
    }
  }

  const handleFinishWorkout = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:8000'
      const res = await fetch(`${backendUrl}/workouttrack/addworkoutentry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          date: new Date().toISOString(),
          exercise: workout?.name || `${currentCategory} Workout`,
          durationInMinutes: workout?.durationInMinutes || 45,
        })
      })
      const data = await res.json()
      if (data.ok) {
        toast.success('Workout completed and logged to your activity history! 🔥')
      } else {
        toast.info('Workout finished! (Sign in to save to your personal cloud log)')
      }
      setIsLiveMode(false)
    } catch (e) {
      toast.info('Great job finishing your workout!')
      setIsLiveMode(false)
    }
  }

  return (
    <div className="workout-page-wrapper">
      {/* Top Breadcrumb & Category Bar */}
      <div className="workout-top-bar">
        <Link href="/" className="back-link">
          <IoChevronBack size={18} /> Dashboard
        </Link>
        <div className="category-pill-list">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              onClick={() => router.push(`/workout/${c.key}`)}
              className={`category-pill ${currentCategory === c.key ? 'active' : ''}`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="workout-loading-state glass-card">
          <IoReloadOutline className="spin-icon" size={32} />
          <p>Loading HD Video Tutorials & Routines...</p>
        </div>
      ) : workout ? (
        <>
          {/* Header Banner */}
          <div className="workout-hero-banner glass-panel">
            <div className="hero-content">
              <div className="hero-badges">
                <span className="badge-glow">{workout.difficulty || 'Intermediate'}</span>
                <span className="hero-meta-item">
                  <IoTimeOutline /> {workout.durationInMinutes} Mins
                </span>
                <span className="hero-meta-item">
                  <IoFlameOutline /> ~{workout.durationInMinutes * 8} kcal
                </span>
              </div>
              <h1 className="hero-title">{workout.name}</h1>
              <p className="hero-desc">{workout.description}</p>
              
              <div className="muscle-tags">
                <span className="tag-label">Target Muscles:</span>
                {workout.targetMuscles?.map((muscle, idx) => (
                  <span key={idx} className="muscle-tag">
                    {muscle}
                  </span>
                ))}
              </div>
            </div>

            <div className="hero-actions">
              {!isLiveMode ? (
                <button
                  className="btn-primary start-workout-btn"
                  onClick={() => {
                    setIsLiveMode(true)
                    setActiveExerciseIdx(0)
                  }}
                >
                  <IoPlayCircleOutline size={22} /> Start Live Workout
                </button>
              ) : (
                <div className="live-workout-controls">
                  <button
                    className="sound-toggle-btn"
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    title={soundEnabled ? 'Mute Chimes' : 'Enable Chimes'}
                  >
                    {soundEnabled ? <IoVolumeHighOutline size={20} /> : <IoVolumeMuteOutline size={20} />}
                  </button>
                  <button
                    className="btn-secondary exit-live-btn"
                    onClick={() => setIsLiveMode(false)}
                  >
                    Exit Mode
                  </button>
                  <button
                    className="btn-primary finish-live-btn"
                    onClick={handleFinishWorkout}
                  >
                    <IoCheckmarkCircle size={20} /> Finish Workout
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mode A: Live Workout Session Tracker */}
          {isLiveMode && (
            <div className="live-session-panel glass-panel">
              <div className="live-session-header">
                <div className="live-status-indicator">
                  <span className="pulse-dot"></span> LIVE WORKOUT SESSION
                </div>
                {isResting && (
                  <div className="rest-timer-countdown">
                    <span className="rest-label">Rest Interval:</span>
                    <span className="rest-digits">{restSecondsLeft}s</span>
                    <button
                      className="skip-rest-btn"
                      onClick={() => {
                        setIsResting(false)
                        setRestSecondsLeft(0)
                      }}
                    >
                      Skip
                    </button>
                  </div>
                )}
              </div>

              {/* Active Exercise in Live Session */}
              {workout.exercises[activeExerciseIdx] && (
                <div className="active-exercise-card glass-card">
                  <div className="active-ex-left">
                    <span className="active-step-num">
                      Exercise {activeExerciseIdx + 1} of {workout.exercises.length}
                    </span>
                    <h2>{workout.exercises[activeExerciseIdx].name}</h2>
                    <p>{workout.exercises[activeExerciseIdx].description}</p>
                    
                    <div className="set-completion-row">
                      <span className="set-progress-text">
                        Sets Completed: {completedSets[workout.exercises[activeExerciseIdx].name] || 0} /{' '}
                        {workout.exercises[activeExerciseIdx].sets}
                      </span>
                      <button
                        className="btn-primary mark-set-btn"
                        onClick={() =>
                          markSetDone(
                            workout.exercises[activeExerciseIdx].name,
                            workout.exercises[activeExerciseIdx].sets,
                            workout.exercises[activeExerciseIdx].rest
                          )
                        }
                      >
                        <IoCheckmarkCircle size={18} /> Complete Set (
                        {(completedSets[workout.exercises[activeExerciseIdx].name] || 0) + 1})
                      </button>
                    </div>
                  </div>

                  <div className="active-ex-nav">
                    <button
                      className="btn-secondary"
                      disabled={activeExerciseIdx === 0}
                      onClick={() => setActiveExerciseIdx((i) => i - 1)}
                    >
                      Previous
                    </button>
                    <button
                      className="btn-secondary"
                      disabled={activeExerciseIdx === workout.exercises.length - 1}
                      onClick={() => setActiveExerciseIdx((i) => i + 1)}
                    >
                      Next Exercise
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mode B: Detailed Video Tutorial & Form Guide Cards */}
          <div className="exercise-section-header">
            <h2>Exercise & Video Form Tutorials</h2>
            <p>Master flawless biomechanics with step-by-step video instruction and cues</p>
          </div>

          <div className="exercise-list-grid">
            {workout.exercises.map((item: Exercise, index: number) => (
              <div key={index} className="exercise-card glass-card">
                <div className="exercise-media-container">
                  {item.videoUrl ? (
                    <div className="video-responsive-frame">
                      <iframe
                        src={item.videoUrl}
                        title={item.name}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  ) : item.imageURL ? (
                    <img src={item.imageURL} alt={item.name} className="exercise-img" />
                  ) : (
                    <div className="placeholder-media">
                      <IoPlayCircleOutline size={48} />
                      <span>HD Video Tutorial</span>
                    </div>
                  )}
                </div>

                <div className="exercise-info-container">
                  <div className="exercise-top-meta">
                    <span className="exercise-index-pill">#{index + 1}</span>
                    <div className="meta-stats">
                      <span className="stat-chip">{item.sets} Sets</span>
                      <span className="stat-chip">{item.reps} Reps</span>
                      <span className="stat-chip">{item.rest}s Rest</span>
                    </div>
                  </div>

                  <h3 className="exercise-heading">{item.name}</h3>
                  <p className="exercise-instructions">{item.description}</p>

                  {item.tips && item.tips.length > 0 && (
                    <div className="exercise-tips-box">
                      <div className="tips-title">
                        <IoSparkles /> Form Perfection Cues:
                      </div>
                      <ul className="tips-list">
                        {item.tips.map((tip, tIdx) => (
                          <li key={tIdx}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : null}
    </div>
  )
}

export default WorkoutPage
