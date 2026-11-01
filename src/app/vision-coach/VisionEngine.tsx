'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import {
  IoCameraOutline,
  IoPlayOutline,
  IoPauseOutline,
  IoRefreshOutline,
  IoVolumeHighOutline,
  IoVolumeMuteOutline,
  IoFlameOutline,
  IoCheckmarkCircle,
  IoWarningOutline,
  IoTimerOutline,
  IoSparkles
} from 'react-icons/io5'

export type ExerciseType = 'squat' | 'bicep_curl' | 'pushup' | 'shoulder_press' | 'lateral_raise'

export interface ExerciseConfig {
  id: ExerciseType
  name: string
  targetMuscle: string
  primaryAngleName: string
  downThreshold: number
  upThreshold: number
  repTriggerDirection: 'down_to_up' | 'up_to_down'
  instructions: string[]
  depthFeedback: {
    excellent: string
    good: string
    poor: string
  }
}

export const EXERCISE_CONFIGS: Record<ExerciseType, ExerciseConfig> = {
  squat: {
    id: 'squat',
    name: 'Barbell / Bodyweight Squats',
    targetMuscle: 'Quadriceps, Glutes & Core',
    primaryAngleName: 'Knee Flexion Angle',
    downThreshold: 90,  // Deep bend (< 90 deg)
    upThreshold: 160,   // Lockout (> 160 deg)
    repTriggerDirection: 'down_to_up',
    instructions: [
      'Stand in frame with your full body visible (head to feet).',
      'Turn slightly at a 45° angle to the camera for optimal knee tracking.',
      'Descend until thighs are parallel or below (knee angle < 90°).',
      'Stand all the way up to full lockout to register the rep.',
    ],
    depthFeedback: {
      excellent: 'PERFECT DEPTH! Below parallel execution.',
      good: 'GOOD DEPTH! Parallel achieved.',
      poor: 'PARTIAL REP! Sink deeper into your hips.',
    },
  },
  bicep_curl: {
    id: 'bicep_curl',
    name: 'Bicep Dumbbell / Barbell Curls',
    targetMuscle: 'Biceps Brachii & Forearms',
    primaryAngleName: 'Elbow Flexion Angle',
    downThreshold: 155, // Full extension (> 155 deg)
    upThreshold: 45,    // Peak contraction (< 45 deg)
    repTriggerDirection: 'up_to_down',
    instructions: [
      'Keep your upper arm and elbow pinned to your ribcage.',
      'Start with your arms completely extended at the bottom.',
      'Curl upward until your forearm touches your bicep.',
      'Control the eccentric lowering phase completely.',
    ],
    depthFeedback: {
      excellent: 'PEAK SQUEEZE! Full range of motion.',
      good: 'SOLID CURL! Good contraction.',
      poor: 'EXTEND FULLY! Do not cut the bottom short.',
    },
  },
  pushup: {
    id: 'pushup',
    name: 'Chest Push-ups',
    targetMuscle: 'Pectorals, Triceps & Anterior Deltoid',
    primaryAngleName: 'Elbow & Spine Angle',
    downThreshold: 90,
    upThreshold: 155,
    repTriggerDirection: 'down_to_up',
    instructions: [
      'Position camera at side view while in pushup plank.',
      'Keep spine neutral (hips aligned with shoulders and ankles).',
      'Lower chest until elbows reach 90° or below.',
      'Push back up to full lockout without sagging hips.',
    ],
    depthFeedback: {
      excellent: 'CHEST TO DECK! Maximum chest stretch.',
      good: 'CLEAN REP! 90-degree break.',
      poor: 'PARTIAL REP! Lower chest closer to floor.',
    },
  },
  shoulder_press: {
    id: 'shoulder_press',
    name: 'Overhead Shoulder Press',
    targetMuscle: 'Deltoids, Upper Chest & Triceps',
    primaryAngleName: 'Elbow Overhead Extension',
    downThreshold: 85,
    upThreshold: 165,
    repTriggerDirection: 'down_to_up',
    instructions: [
      'Face camera or sit at 45° angle.',
      'Lower dumbbells/barbell to ear/chin level.',
      'Press smoothly overhead until arms lock out.',
      'Avoid hyperextending lower lumbar spine.',
    ],
    depthFeedback: {
      excellent: 'FULL OVERHEAD LOCKOUT! Strong deltoid drive.',
      good: 'GOOD PRESS! Clean lockout.',
      poor: 'PRESS HIGHER! Lock out overhead.',
    },
  },
  lateral_raise: {
    id: 'lateral_raise',
    name: 'Dumbbell Lateral Raises',
    targetMuscle: 'Lateral Deltoids',
    primaryAngleName: 'Shoulder Abduction Angle',
    downThreshold: 30,  // Arms down
    upThreshold: 85,    // Arms horizontal (~90 deg)
    repTriggerDirection: 'up_to_down',
    instructions: [
      'Face camera with dumbbells by sides.',
      'Raise arms out to sides with slight elbow bend.',
      'Stop when elbows reach shoulder height (~90°).',
      'Lower under 2-second control.',
    ],
    depthFeedback: {
      excellent: 'SHOULDER LEVEL! Perfect lateral tension.',
      good: 'GOOD HEIGHT! Deltoids fired.',
      poor: 'RAISE TO SHOULDER HEIGHT! Do not swing momentum.',
    },
  },
}

// Landmark Indexes from MediaPipe Pose
const POSE_LANDMARKS = {
  NOSE: 0,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
}

// Calculate angle between three 2D points (B is pivot vertex)
export function calculateAngle(
  pointA: { x: number; y: number },
  pointB: { x: number; y: number },
  pointC: { x: number; y: number }
): number {
  const radians =
    Math.atan2(pointC.y - pointB.y, pointC.x - pointB.x) -
    Math.atan2(pointA.y - pointB.y, pointA.x - pointB.x)
  let angle = Math.abs((radians * 180.0) / Math.PI)
  if (angle > 180.0) {
    angle = 360.0 - angle
  }
  return Math.round(angle)
}

interface VisionEngineProps {
  exercise: ExerciseType
  isTracking: boolean
  useSimulator: boolean
  isVoiceEnabled: boolean
  isSoundEnabled: boolean
  onRepCountChange: (count: number) => void
  onFormScoreChange: (score: number) => void
  onDiagnosticUpdate: (message: string, isAlert: boolean) => void
  onCurrentAngleChange: (angle: number) => void
}

export default function VisionEngine({
  exercise,
  isTracking,
  useSimulator,
  isVoiceEnabled,
  isSoundEnabled,
  onRepCountChange,
  onFormScoreChange,
  onDiagnosticUpdate,
  onCurrentAngleChange,
}: VisionEngineProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [cameraReady, setCameraReady] = useState<boolean>(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [fps, setFps] = useState<number>(0)

  // Tracking state refs (avoid React re-render lags inside 60FPS animation loop)
  const repsRef = useRef<number>(0)
  const stageRef = useRef<'UP' | 'DOWN' | null>(null)
  const minAngleDuringRepRef = useRef<number>(180)
  const maxAngleDuringRepRef = useRef<number>(0)
  const formScoresRef = useRef<number[]>([])
  const lastRepTimeRef = useRef<number>(0)
  const reqAnimRef = useRef<number>(0)
  const streamRef = useRef<MediaStream | null>(null)

  // MediaPipe Pose instance ref
  const poseRef = useRef<any>(null)

  // Audio synthesizer via Web Audio API
  const audioCtxRef = useRef<AudioContext | null>(null)

  const playChimeSound = useCallback(() => {
    if (!isSoundEnabled) return
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }
      const ctx = audioCtxRef.current
      if (ctx.state === 'suspended') {
        ctx.resume()
      }
      const now = ctx.currentTime
      // Play ascending high-tech chime (C5 -> E5 -> G5)
      const freqs = [523.25, 659.25, 783.99]
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, now + idx * 0.08)
        gain.gain.setValueAtTime(0.18, now + idx * 0.08)
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.25)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now + idx * 0.08)
        osc.stop(now + idx * 0.08 + 0.25)
      })
    } catch (e) {
      // AudioContext policy fallback
    }
  }, [isSoundEnabled])

  const speakText = useCallback(
    (text: string) => {
      if (!isVoiceEnabled || typeof window === 'undefined' || !window.speechSynthesis) return
      try {
        window.speechSynthesis.cancel() // clear queue to avoid backlog
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = 1.15
        utterance.pitch = 1.05
        window.speechSynthesis.speak(utterance)
      } catch (e) {
        // speech synthesis fallback
      }
    },
    [isVoiceEnabled]
  )

  // Process Landmarks and run Exercise Kinematics State Machine
  const processKinematics = useCallback(
    (landmarks: any[], ctx: CanvasRenderingContext2D, width: number, height: number) => {
      if (!landmarks || landmarks.length < 29) return

      const config = EXERCISE_CONFIGS[exercise]
      let currentAngle = 180
      let pivotPoint = { x: 0, y: 0 }
      let isFormGood = true
      let diagnosticMsg = 'Tracking form in real time...'
      let isAlert = false

      // Helper to convert normalized coordinate to pixel
      const toPixel = (pt: any) => ({ x: pt.x * width, y: pt.y * height })

      // Determine points based on exercise
      if (exercise === 'squat') {
        // Use the knee that has higher visibility (or right knee by default)
        const leftVis = landmarks[POSE_LANDMARKS.LEFT_KNEE]?.visibility ?? 0
        const rightVis = landmarks[POSE_LANDMARKS.RIGHT_KNEE]?.visibility ?? 0
        const isLeft = leftVis > rightVis

        const hip = toPixel(landmarks[isLeft ? POSE_LANDMARKS.LEFT_HIP : POSE_LANDMARKS.RIGHT_HIP])
        const knee = toPixel(landmarks[isLeft ? POSE_LANDMARKS.LEFT_KNEE : POSE_LANDMARKS.RIGHT_KNEE])
        const ankle = toPixel(landmarks[isLeft ? POSE_LANDMARKS.LEFT_ANKLE : POSE_LANDMARKS.RIGHT_ANKLE])

        currentAngle = calculateAngle(hip, knee, ankle)
        pivotPoint = knee

        // Back lean check: angle between shoulder, hip, and vertical
        const shoulder = toPixel(landmarks[isLeft ? POSE_LANDMARKS.LEFT_SHOULDER : POSE_LANDMARKS.RIGHT_SHOULDER])
        const torsoAngle = calculateAngle(shoulder, hip, { x: hip.x, y: hip.y - 100 })
        if (torsoAngle > 48 && currentAngle < 110) {
          diagnosticMsg = 'KEEP CHEST HIGH! Excessive forward torso lean.'
          isAlert = true
          isFormGood = false
        }
      } else if (exercise === 'bicep_curl') {
        const leftVis = landmarks[POSE_LANDMARKS.LEFT_ELBOW]?.visibility ?? 0
        const rightVis = landmarks[POSE_LANDMARKS.RIGHT_ELBOW]?.visibility ?? 0
        const isLeft = leftVis > rightVis

        const shoulder = toPixel(landmarks[isLeft ? POSE_LANDMARKS.LEFT_SHOULDER : POSE_LANDMARKS.RIGHT_SHOULDER])
        const elbow = toPixel(landmarks[isLeft ? POSE_LANDMARKS.LEFT_ELBOW : POSE_LANDMARKS.RIGHT_ELBOW])
        const wrist = toPixel(landmarks[isLeft ? POSE_LANDMARKS.LEFT_WRIST : POSE_LANDMARKS.RIGHT_WRIST])

        currentAngle = calculateAngle(shoulder, elbow, wrist)
        pivotPoint = elbow
      } else if (exercise === 'pushup') {
        const shoulder = toPixel(landmarks[POSE_LANDMARKS.RIGHT_SHOULDER])
        const elbow = toPixel(landmarks[POSE_LANDMARKS.RIGHT_ELBOW])
        const wrist = toPixel(landmarks[POSE_LANDMARKS.RIGHT_WRIST])
        const hip = toPixel(landmarks[POSE_LANDMARKS.RIGHT_HIP])
        const ankle = toPixel(landmarks[POSE_LANDMARKS.RIGHT_ANKLE])

        currentAngle = calculateAngle(shoulder, elbow, wrist)
        pivotPoint = elbow

        // Spine alignment check
        const spineAngle = calculateAngle(shoulder, hip, ankle)
        if (spineAngle < 152) {
          diagnosticMsg = 'HIPS SAGGING! Engage core & glutes straight.'
          isAlert = true
          isFormGood = false
        }
      } else if (exercise === 'shoulder_press') {
        const shoulder = toPixel(landmarks[POSE_LANDMARKS.RIGHT_SHOULDER])
        const elbow = toPixel(landmarks[POSE_LANDMARKS.RIGHT_ELBOW])
        const wrist = toPixel(landmarks[POSE_LANDMARKS.RIGHT_WRIST])
        currentAngle = calculateAngle(shoulder, elbow, wrist)
        pivotPoint = elbow
      } else if (exercise === 'lateral_raise') {
        const hip = toPixel(landmarks[POSE_LANDMARKS.RIGHT_HIP])
        const shoulder = toPixel(landmarks[POSE_LANDMARKS.RIGHT_SHOULDER])
        const elbow = toPixel(landmarks[POSE_LANDMARKS.RIGHT_ELBOW])
        currentAngle = calculateAngle(hip, shoulder, elbow)
        pivotPoint = shoulder
      }

      onCurrentAngleChange(currentAngle)

      // Rep Counting State Machine
      const now = Date.now()
      if (isTracking) {
        if (config.repTriggerDirection === 'down_to_up') {
          // e.g. Squat / Pushup: goes DOWN, then triggers rep upon returning UP
          if (currentAngle <= config.downThreshold) {
            stageRef.current = 'DOWN'
            minAngleDuringRepRef.current = Math.min(minAngleDuringRepRef.current, currentAngle)
          }

          if (currentAngle >= config.upThreshold && stageRef.current === 'DOWN') {
            if (now - lastRepTimeRef.current > 750) {
              // Valid Rep Register!
              repsRef.current += 1
              lastRepTimeRef.current = now
              stageRef.current = 'UP'

              // Evaluate Rep Quality
              const reachedMin = minAngleDuringRepRef.current
              let repScore = 100
              if (reachedMin <= config.downThreshold - 10) {
                repScore = 100
                diagnosticMsg = config.depthFeedback.excellent
              } else if (reachedMin <= config.downThreshold) {
                repScore = 90
                diagnosticMsg = config.depthFeedback.good
              } else {
                repScore = 65
                diagnosticMsg = config.depthFeedback.poor
                isAlert = true
              }

              formScoresRef.current.push(repScore)
              const avgScore = Math.round(
                formScoresRef.current.reduce((a, b) => a + b, 0) / formScoresRef.current.length
              )

              onRepCountChange(repsRef.current)
              onFormScoreChange(avgScore)
              playChimeSound()
              speakText(String(repsRef.current))

              // Reset min tracker
              minAngleDuringRepRef.current = 180
            }
          }
        } else {
          // e.g. Bicep Curl / Lateral Raise: starts down, goes UP, triggers upon return
          if (currentAngle <= config.upThreshold) {
            stageRef.current = 'UP'
            minAngleDuringRepRef.current = Math.min(minAngleDuringRepRef.current, currentAngle)
          }

          if (currentAngle >= config.downThreshold && stageRef.current === 'UP') {
            if (now - lastRepTimeRef.current > 750) {
              repsRef.current += 1
              lastRepTimeRef.current = now
              stageRef.current = 'DOWN'

              const reachedMin = minAngleDuringRepRef.current
              let repScore = 100
              if (reachedMin <= config.upThreshold) {
                repScore = 100
                diagnosticMsg = config.depthFeedback.excellent
              } else {
                repScore = 70
                diagnosticMsg = config.depthFeedback.poor
                isAlert = true
              }

              formScoresRef.current.push(repScore)
              const avgScore = Math.round(
                formScoresRef.current.reduce((a, b) => a + b, 0) / formScoresRef.current.length
              )

              onRepCountChange(repsRef.current)
              onFormScoreChange(avgScore)
              playChimeSound()
              speakText(String(repsRef.current))

              minAngleDuringRepRef.current = 180
            }
          }
        }
      }

      onDiagnosticUpdate(diagnosticMsg, isAlert)

      // Draw Futuristic Skeleton & Kinetic Angle Badge on Canvas
      drawKineticOverlay(ctx, landmarks, pivotPoint, currentAngle, width, height, isFormGood)
    },
    [
      exercise,
      isTracking,
      playChimeSound,
      speakText,
      onRepCountChange,
      onFormScoreChange,
      onDiagnosticUpdate,
      onCurrentAngleChange,
    ]
  )

  // Draw Glowing Skeletal Bones, Nodes, and Angle Arc
  const drawKineticOverlay = (
    ctx: CanvasRenderingContext2D,
    landmarks: any[],
    pivot: { x: number; y: number },
    angle: number,
    width: number,
    height: number,
    isGoodForm: boolean
  ) => {
    const toPx = (pt: any) => ({ x: pt.x * width, y: pt.y * height })

    // Skeleton bone connections
    const CONNECTIONS = [
      [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.RIGHT_SHOULDER],
      [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_ELBOW],
      [POSE_LANDMARKS.LEFT_ELBOW, POSE_LANDMARKS.LEFT_WRIST],
      [POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_ELBOW],
      [POSE_LANDMARKS.RIGHT_ELBOW, POSE_LANDMARKS.RIGHT_WRIST],
      [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_HIP],
      [POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_HIP],
      [POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.RIGHT_HIP],
      [POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.LEFT_KNEE],
      [POSE_LANDMARKS.LEFT_KNEE, POSE_LANDMARKS.LEFT_ANKLE],
      [POSE_LANDMARKS.RIGHT_HIP, POSE_LANDMARKS.RIGHT_KNEE],
      [POSE_LANDMARKS.RIGHT_KNEE, POSE_LANDMARKS.RIGHT_ANKLE],
    ]

    // Draw glowing neon kinetic bones
    ctx.lineWidth = 4
    ctx.strokeStyle = isGoodForm ? 'rgba(6, 182, 212, 0.75)' : 'rgba(239, 68, 68, 0.85)'
    ctx.shadowBlur = 12
    ctx.shadowColor = isGoodForm ? '#06b6d4' : '#ef4444'

    CONNECTIONS.forEach(([startIdx, endIdx]) => {
      const p1 = landmarks[startIdx]
      const p2 = landmarks[endIdx]
      if (p1 && p2 && (p1.visibility ?? 1) > 0.4 && (p2.visibility ?? 1) > 0.4) {
        const pt1 = toPx(p1)
        const pt2 = toPx(p2)
        ctx.beginPath()
        ctx.moveTo(pt1.x, pt1.y)
        ctx.lineTo(pt2.x, pt2.y)
        ctx.stroke()
      }
    })

    // Draw Joint Nodes
    ctx.shadowBlur = 10
    ctx.shadowColor = '#10b981'
    landmarks.forEach((lm: any, idx: number) => {
      if ((lm.visibility ?? 1) > 0.4 && idx >= 11 && idx <= 28) {
        const pt = toPx(lm)
        ctx.fillStyle = '#10b981'
        ctx.beginPath()
        ctx.arc(pt.x, pt.y, 5, 0, 2 * Math.PI)
        ctx.fill()
        // White core dot
        ctx.fillStyle = '#ffffff'
        ctx.beginPath()
        ctx.arc(pt.x, pt.y, 2, 0, 2 * Math.PI)
        ctx.fill()
      }
    })

    // Draw Dynamic Angle Arc Badge around Pivot Vertex
    if (pivot.x > 0 && pivot.y > 0) {
      ctx.shadowBlur = 16
      ctx.shadowColor = '#06b6d4'

      // Pivot halo
      ctx.strokeStyle = '#06b6d4'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(pivot.x, pivot.y, 26, 0, 2 * Math.PI)
      ctx.stroke()

      // Angle Text Plaque
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)'
      ctx.beginPath()
      ctx.roundRect(pivot.x + 18, pivot.y - 20, 70, 32, 8)
      ctx.fill()

      ctx.strokeStyle = 'rgba(6, 182, 212, 0.6)'
      ctx.lineWidth = 1.5
      ctx.stroke()

      ctx.shadowBlur = 0
      ctx.fillStyle = '#f8fafc'
      ctx.font = 'bold 15px monospace'
      ctx.fillText(`${angle}°`, pivot.x + 30, pivot.y + 2)
    }
  }

  // --- KINETIC SIMULATOR / DEMO MODE (For testing without webcam) ---
  const runSimulatorLoop = useCallback(() => {
    let simTime = 0
    let lastFpsUpdate = Date.now()
    let frameCount = 0

    const simLoop = () => {
      simTime += 0.04
      frameCount++
      if (Date.now() - lastFpsUpdate >= 1000) {
        setFps(frameCount)
        frameCount = 0
        lastFpsUpdate = Date.now()
      }

      const canvas = canvasRef.current
      if (canvas) {
        const ctx = canvas.getContext('2d')
        if (ctx) {
          const w = canvas.width
          const h = canvas.height

          // Clear & render simulated dark cyberpunk gym background
          ctx.fillStyle = '#080a10'
          ctx.fillRect(0, 0, w, h)

          // Background perspective grid
          ctx.strokeStyle = 'rgba(6, 182, 212, 0.08)'
          ctx.lineWidth = 1
          for (let i = 0; i < w; i += 40) {
            ctx.beginPath()
            ctx.moveTo(i, 0)
            ctx.lineTo(i, h)
            ctx.stroke()
          }

          // Generate simulated humanoid lifter motion based on sin wave
          const cycle = (Math.sin(simTime * 1.5) + 1) / 2 // 0 to 1
          const kneeBendY = 320 + cycle * 120
          const hipY = 240 + cycle * 120
          const shoulderY = 130 + cycle * 110

          // Synthesized landmarks for demonstration
          const simLandmarks: any[] = Array(33).fill({ x: 0.5, y: 0.5, visibility: 0.9 })
          simLandmarks[POSE_LANDMARKS.NOSE] = { x: 0.5, y: (shoulderY - 50) / h, visibility: 0.95 }
          simLandmarks[POSE_LANDMARKS.RIGHT_SHOULDER] = { x: 0.44, y: shoulderY / h, visibility: 0.95 }
          simLandmarks[POSE_LANDMARKS.LEFT_SHOULDER] = { x: 0.56, y: shoulderY / h, visibility: 0.95 }
          simLandmarks[POSE_LANDMARKS.RIGHT_ELBOW] = {
            x: 0.38,
            y: (shoulderY + 60 + cycle * 30) / h,
            visibility: 0.95,
          }
          simLandmarks[POSE_LANDMARKS.RIGHT_WRIST] = {
            x: 0.38,
            y: (shoulderY + 120 - (exercise === 'bicep_curl' ? cycle * 80 : 0)) / h,
            visibility: 0.95,
          }
          simLandmarks[POSE_LANDMARKS.RIGHT_HIP] = { x: 0.46, y: hipY / h, visibility: 0.95 }
          simLandmarks[POSE_LANDMARKS.LEFT_HIP] = { x: 0.54, y: hipY / h, visibility: 0.95 }
          simLandmarks[POSE_LANDMARKS.RIGHT_KNEE] = {
            x: 0.43 - cycle * 0.05,
            y: kneeBendY / h,
            visibility: 0.95,
          }
          simLandmarks[POSE_LANDMARKS.LEFT_KNEE] = {
            x: 0.57 + cycle * 0.05,
            y: kneeBendY / h,
            visibility: 0.95,
          }
          simLandmarks[POSE_LANDMARKS.RIGHT_ANKLE] = { x: 0.44, y: 460 / h, visibility: 0.95 }
          simLandmarks[POSE_LANDMARKS.LEFT_ANKLE] = { x: 0.56, y: 460 / h, visibility: 0.95 }

          processKinematics(simLandmarks, ctx, w, h)
        }
      }

      reqAnimRef.current = requestAnimationFrame(simLoop)
    }

    reqAnimRef.current = requestAnimationFrame(simLoop)
  }, [exercise, processKinematics])

  // --- REAL WEBCAM + MEDIAPIPE POSE PIPELINE ---
  const startCameraAndPose = useCallback(async () => {
    try {
      setCameraError(null)

      // Request Webcam
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: false,
      })
      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }

      // Initialize MediaPipe Pose
      const { Pose } = await import('@mediapipe/pose')
      const pose = new Pose({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
      })

      pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        smoothSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      })

      pose.onResults((results: any) => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const w = canvas.width
        const h = canvas.height

        // Clear canvas
        ctx.clearRect(0, 0, w, h)

        // Draw camera video feed
        if (results.image) {
          ctx.save()
          // Mirror horizontally for intuitive user webcam view
          ctx.scale(-1, 1)
          ctx.translate(-w, 0)
          ctx.drawImage(results.image, 0, 0, w, h)
          ctx.restore()
        }

        // Overlay tracking
        if (results.poseLandmarks) {
          // Adjust mirrored landmarks
          const mirroredLandmarks = results.poseLandmarks.map((lm: any) => ({
            ...lm,
            x: 1 - lm.x, // mirror horizontally
          }))
          processKinematics(mirroredLandmarks, ctx, w, h)
        }
      })

      poseRef.current = pose
      setCameraReady(true)

      // Camera feed loop
      let lastFrameTime = Date.now()
      let frameCount = 0

      const sendFrame = async () => {
        if (videoRef.current && videoRef.current.readyState >= 2 && poseRef.current) {
          await poseRef.current.send({ image: videoRef.current })
          frameCount++
          if (Date.now() - lastFrameTime >= 1000) {
            setFps(frameCount)
            frameCount = 0
            lastFrameTime = Date.now()
          }
        }
        reqAnimRef.current = requestAnimationFrame(sendFrame)
      }

      reqAnimRef.current = requestAnimationFrame(sendFrame)
    } catch (err: any) {
      console.warn('Camera initialization error:', err)
      setCameraError(err.message || 'Unable to access webcam. Switching to simulator mode.')
      setCameraReady(false)
    }
  }, [processKinematics])

  // Lifecycle control: Switch between Camera vs Simulator Mode
  useEffect(() => {
    // Reset state counters when switching exercise
    repsRef.current = 0
    stageRef.current = null
    formScoresRef.current = []
    onRepCountChange(0)
    onFormScoreChange(100)

    if (useSimulator) {
      // Stop webcam if active
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
        streamRef.current = null
      }
      runSimulatorLoop()
    } else {
      startCameraAndPose()
    }

    return () => {
      cancelAnimationFrame(reqAnimRef.current)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
      }
      if (poseRef.current) {
        try {
          poseRef.current.close()
        } catch (e) {}
      }
    }
  }, [exercise, useSimulator, startCameraAndPose, runSimulatorLoop, onRepCountChange, onFormScoreChange])

  return (
    <div className="vision-viewport-box">
      {/* Hidden source video element */}
      <video
        ref={videoRef}
        playsInline
        muted
        style={{ display: 'none' }}
        width={640}
        height={480}
      />

      {/* Main Vision Canvas with mirrored feed + kinetic overlay */}
      <canvas
        ref={canvasRef}
        width={640}
        height={480}
        className="vision-canvas"
      />

      {/* Camera / Feed Status Overlay */}
      <div className="vision-feed-badge-strip">
        <div className="feed-status-pill">
          <span className={`status-dot ${useSimulator ? 'simulator' : cameraReady ? 'live' : 'starting'}`} />
          <span>{useSimulator ? 'Simulator Demo Mode' : cameraReady ? 'Live Camera (60 FPS)' : 'Initializing Vision...'}</span>
        </div>
        <div className="fps-counter-badge">{fps} FPS</div>
      </div>

      {cameraError && (
        <div className="camera-fallback-alert">
          <IoWarningOutline size={20} />
          <span>{cameraError}</span>
        </div>
      )}
    </div>
  )
}
