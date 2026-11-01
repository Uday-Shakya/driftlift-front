'use client'

import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export interface MuscleInfo {
  key: string
  name: string
  category: 'chest' | 'back' | 'abs' | 'shoulder' | 'biceps' | 'legs'
  side?: 'front' | 'back' | 'both'
  primaryAction: string
  recommendedExercises: string[]
  recoveryStretches: string[]
  targetWorkoutUrl: string
  defaultFatigue: number
}

export const MUSCLE_REGISTRY: Record<string, MuscleInfo> = {
  chest: {
    key: 'chest',
    name: 'Pectoralis Major & Minor',
    category: 'chest',
    side: 'front',
    primaryAction: 'Horizontal adduction, shoulder flexion, pushing power',
    recommendedExercises: ['Incline Barbell Press', 'Dumbbell Flyes', 'Weighted Dips', 'Cable Crossover'],
    recoveryStretches: ['Doorway Chest Stretch', 'Lying Foam Roller Opener', 'Cobra Stretch'],
    targetWorkoutUrl: '/workout/chest',
    defaultFatigue: 82,
  },
  abs: {
    key: 'abs',
    name: 'Rectus Abdominis (6-Pack)',
    category: 'abs',
    side: 'front',
    primaryAction: 'Spinal flexion, core stability, intra-abdominal pressure',
    recommendedExercises: ['Hanging Leg Raises', 'Cable Crunches', 'Ab Wheel Rollouts', 'Dragon Flags'],
    recoveryStretches: ['Cat-Cow Stretch', 'Sphinx Pose', 'Child’s Pose with Reach'],
    targetWorkoutUrl: '/workout/abs',
    defaultFatigue: 45,
  },
  obliques: {
    key: 'obliques',
    name: 'External & Internal Obliques',
    category: 'abs',
    side: 'front',
    primaryAction: 'Rotational power, anti-rotational core stabilization',
    recommendedExercises: ['Russian Twists', 'Side Plank Pulses', 'Woodchoppers'],
    recoveryStretches: ['Standing Lateral Reach', 'Supine Spinal Twist'],
    targetWorkoutUrl: '/workout/abs',
    defaultFatigue: 30,
  },
  shoulders: {
    key: 'shoulders',
    name: 'Deltoids (Anterior, Lateral, Posterior)',
    category: 'shoulder',
    side: 'both',
    primaryAction: 'Arm abduction, overhead press, shoulder rotation',
    recommendedExercises: ['Overhead Military Press', 'Dumbbell Lateral Raises', 'Face Pulls', 'Reverse Pec Deck'],
    recoveryStretches: ['Cross-Body Shoulder Stretch', 'Sleeper Stretch', 'Thread the Needle'],
    targetWorkoutUrl: '/workout/shoulder',
    defaultFatigue: 70,
  },
  biceps: {
    key: 'biceps',
    name: 'Biceps Brachii & Brachialis',
    category: 'biceps',
    side: 'front',
    primaryAction: 'Elbow flexion, forearm supination',
    recommendedExercises: ['Incline Dumbbell Curls', 'Barbell Preacher Curls', 'Hammer Curls'],
    recoveryStretches: ['Wall Bicep Stretch', 'Wrist Extensor Pull'],
    targetWorkoutUrl: '/workout/biceps',
    defaultFatigue: 58,
  },
  triceps: {
    key: 'triceps',
    name: 'Triceps Brachii (Long, Lateral, Medial)',
    category: 'biceps',
    side: 'back',
    primaryAction: 'Elbow extension, pressing lockouts',
    recommendedExercises: ['Skull Crushers', 'Overhead Cable Extensions', 'Rope Pushdowns'],
    recoveryStretches: ['Overhead Triceps Pull', 'Cross-Arm Triceps Stretch'],
    targetWorkoutUrl: '/workout/biceps',
    defaultFatigue: 65,
  },
  forearms: {
    key: 'forearms',
    name: 'Brachioradialis & Forearm Flexors',
    category: 'biceps',
    side: 'front',
    primaryAction: 'Grip strength, wrist flexion/extension',
    recommendedExercises: ['Wrist Curls', 'Farmer Walks', 'Plate Pinches'],
    recoveryStretches: ['Prayer Stretch', 'Forearm Flexor Extension'],
    targetWorkoutUrl: '/workout/biceps',
    defaultFatigue: 25,
  },
  back_traps: {
    key: 'back_traps',
    name: 'Trapezius (Upper & Mid Traps)',
    category: 'back',
    side: 'back',
    primaryAction: 'Scapular elevation, neck support, retraction',
    recommendedExercises: ['Barbell Shrugs', 'Kelso Shrugs', 'Farmer Carries'],
    recoveryStretches: ['Upper Trap Neck Tilt', 'Levator Scapulae Stretch'],
    targetWorkoutUrl: '/workout/back',
    defaultFatigue: 40,
  },
  back_lats: {
    key: 'back_lats',
    name: 'Latissimus Dorsi (Lats)',
    category: 'back',
    side: 'back',
    primaryAction: 'Shoulder adduction, horizontal pulling, V-Taper posture',
    recommendedExercises: ['Weighted Pull-Ups', 'Lat Pulldowns', 'Barbell Rows', 'Single-Arm Dumbbell Rows'],
    recoveryStretches: ['Doorframe Lat Hang', 'Child’s Pose Lat Reach', 'Foam Roller Lat Roll'],
    targetWorkoutUrl: '/workout/back',
    defaultFatigue: 88,
  },
  back_lower: {
    key: 'back_lower',
    name: 'Erector Spinae (Lower Back)',
    category: 'back',
    side: 'back',
    primaryAction: 'Spinal extension, hip hinge stability',
    recommendedExercises: ['Conventional Deadlifts', 'Back Extensions', 'Bird-Dog Iso Holds'],
    recoveryStretches: ['Child’s Pose', 'Knee-to-Chest Stretch', 'Pelvic Tilts'],
    targetWorkoutUrl: '/workout/back',
    defaultFatigue: 50,
  },
  glutes: {
    key: 'glutes',
    name: 'Gluteus Maximus & Medius',
    category: 'legs',
    side: 'back',
    primaryAction: 'Hip extension, hip abduction, explosive athletic propulsion',
    recommendedExercises: ['Barbell Hip Thrusts', 'Romanian Deadlifts', 'Bulgarian Split Squats', 'Cable Kickbacks'],
    recoveryStretches: ['Figure-4 Stretch', 'Pigeon Pose', 'Glute Foam Rolling'],
    targetWorkoutUrl: '/workout/legs',
    defaultFatigue: 60,
  },
  quads: {
    key: 'quads',
    name: 'Quadriceps Femoris (Front Thighs)',
    category: 'legs',
    side: 'front',
    primaryAction: 'Knee extension, squat drive, sprinting power',
    recommendedExercises: ['Barbell Back Squats', 'Leg Press', 'Hack Squats', 'Walking Lunges'],
    recoveryStretches: ['Standing Quad Stretch', 'Couch Stretch', 'Foam Rolling IT Band & Quads'],
    targetWorkoutUrl: '/workout/legs',
    defaultFatigue: 92,
  },
  hamstrings: {
    key: 'hamstrings',
    name: 'Biceps Femoris & Semitendinosus',
    category: 'legs',
    side: 'back',
    primaryAction: 'Knee flexion, hip hinge deceleration',
    recommendedExercises: ['Seated Leg Curls', 'Stiff-Leg Deadlifts', 'Nordic Hamstring Curls'],
    recoveryStretches: ['Seated Hamstring Reach', 'Standing Towel Hamstring Stretch'],
    targetWorkoutUrl: '/workout/legs',
    defaultFatigue: 78,
  },
  calves: {
    key: 'calves',
    name: 'Gastrocnemius & Soleus',
    category: 'legs',
    side: 'both',
    primaryAction: 'Plantar flexion, ankle stability, jumping recoil',
    recommendedExercises: ['Standing Calf Raises', 'Seated Calf Raises', 'Donkey Calf Machine'],
    recoveryStretches: ['Wall Calf Push Stretch', 'Downward Dog Ankle Pedals'],
    targetWorkoutUrl: '/workout/legs',
    defaultFatigue: 35,
  },
}

export function getFatigueColorHex(val: number): string {
  if (val <= 25) return '#10b981' // Emerald (Fresh/Recovered)
  if (val <= 50) return '#06b6d4' // Cyan (Optimal)
  if (val <= 70) return '#f59e0b' // Amber (Stimulated)
  if (val <= 85) return '#f97316' // Orange (Fatigued)
  return '#ef4444' // Laser Crimson (Exhausted / High DOMS)
}

export function getFatigueLevelLabel(val: number): { label: string; color: string; badge: string } {
  if (val <= 25) return { label: 'Fully Recovered', color: '#10b981', badge: '100% Ready' }
  if (val <= 50) return { label: 'Optimal Capacity', color: '#06b6d4', badge: 'Ready to Train' }
  if (val <= 70) return { label: 'Mild Fatigue', color: '#f59e0b', badge: 'Recovering (70%)' }
  if (val <= 85) return { label: 'High Fatigue', color: '#f97316', badge: 'DOMS Warning' }
  return { label: 'Exhausted / Rest Needed', color: '#ef4444', badge: 'Active Rest / Recovery' }
}

interface HeatmapCanvasProps {
  fatigueLevels: Record<string, number>
  selectedMuscleKey: string | null
  onSelectMuscle: (key: string) => void
  cameraPreset: 'front' | 'back' | 'iso' | 'upper' | 'lower' | null
  isAutoRotate: boolean
}

export default function HeatmapCanvas({
  fatigueLevels,
  selectedMuscleKey,
  onSelectMuscle,
  cameraPreset,
  isAutoRotate,
}: HeatmapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [hoveredMuscle, setHoveredMuscle] = useState<MuscleInfo | null>(null)
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null)

  // Three.js instances stored in refs
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const muscleMeshesRef = useRef<Map<string, THREE.Mesh[]>>(new Map())
  const reqIdRef = useRef<number>(0)

  // Build Procedural Anatomical 3D Mannequin
  const buildAnatomicalMannequin = (scene: THREE.Scene) => {
    muscleMeshesRef.current.clear()

    const addMuscleMesh = (
      muscleKey: string,
      geometry: THREE.BufferGeometry,
      position: [number, number, number],
      rotation: [number, number, number] = [0, 0, 0],
      scale: [number, number, number] = [1, 1, 1]
    ) => {
      const fatigue = fatigueLevels[muscleKey] ?? MUSCLE_REGISTRY[muscleKey]?.defaultFatigue ?? 50
      const colorHex = getFatigueColorHex(fatigue)

      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color('#141824'),
        emissive: new THREE.Color(colorHex),
        emissiveIntensity: 0.75,
        roughness: 0.35,
        metalness: 0.6,
      })

      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.set(...position)
      mesh.rotation.set(...rotation)
      mesh.scale.set(...scale)
      mesh.castShadow = true
      mesh.receiveShadow = true
      mesh.userData = { muscleKey }

      scene.add(mesh)

      if (!muscleMeshesRef.current.has(muscleKey)) {
        muscleMeshesRef.current.set(muscleKey, [])
      }
      muscleMeshesRef.current.get(muscleKey)!.push(mesh)
      return mesh
    }

    // --- Neutral Skeletal Frame (Non-interactive structural parts) ---
    const boneMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a2133,
      roughness: 0.8,
      metalness: 0.2,
      wireframe: false,
    })

    // Head / Cranium
    const headGeom = new THREE.SphereGeometry(0.24, 24, 24)
    headGeom.scale(0.85, 1.15, 0.95)
    const headMesh = new THREE.Mesh(headGeom, boneMaterial)
    headMesh.position.set(0, 1.95, 0)
    scene.add(headMesh)

    // Neck
    const neckGeom = new THREE.CylinderGeometry(0.1, 0.12, 0.22, 16)
    const neckMesh = new THREE.Mesh(neckGeom, boneMaterial)
    neckMesh.position.set(0, 1.72, 0)
    scene.add(neckMesh)

    // Spine & Pelvis frame
    const pelvisGeom = new THREE.CylinderGeometry(0.26, 0.22, 0.22, 16)
    const pelvisMesh = new THREE.Mesh(pelvisGeom, boneMaterial)
    pelvisMesh.position.set(0, 0.52, 0)
    scene.add(pelvisMesh)

    // --- MUSCLE GROUPS (High fidelity segmented anatomy) ---

    // 1. CHEST (Pectoralis Major Left & Right)
    const chestGeom = new THREE.BoxGeometry(0.26, 0.24, 0.14)
    addMuscleMesh('chest', chestGeom, [-0.15, 1.48, 0.11], [0.1, 0.08, -0.05])
    addMuscleMesh('chest', chestGeom, [0.15, 1.48, 0.11], [0.1, -0.08, 0.05])

    // 2. ABDOMINALS (Rectus Abdominis 6-Pack segments)
    const absSegmentGeom = new THREE.BoxGeometry(0.12, 0.1, 0.1)
    // Upper Abs
    addMuscleMesh('abs', absSegmentGeom, [-0.07, 1.25, 0.11])
    addMuscleMesh('abs', absSegmentGeom, [0.07, 1.25, 0.11])
    // Mid Abs
    addMuscleMesh('abs', absSegmentGeom, [-0.07, 1.12, 0.105])
    addMuscleMesh('abs', absSegmentGeom, [0.07, 1.12, 0.105])
    // Lower Abs
    addMuscleMesh('abs', absSegmentGeom, [-0.07, 0.99, 0.095])
    addMuscleMesh('abs', absSegmentGeom, [0.07, 0.99, 0.095])

    // 3. OBLIQUES (Flanking abdomen)
    const obliqueGeom = new THREE.BoxGeometry(0.1, 0.32, 0.12)
    addMuscleMesh('obliques', obliqueGeom, [-0.22, 1.12, 0.06], [0, 0, 0.15])
    addMuscleMesh('obliques', obliqueGeom, [0.22, 1.12, 0.06], [0, 0, -0.15])

    // 4. SHOULDERS (Deltoids - Anterior / Lateral / Posterior)
    const deltGeom = new THREE.SphereGeometry(0.16, 16, 16)
    deltGeom.scale(1.1, 1.2, 1.1)
    addMuscleMesh('shoulders', deltGeom, [-0.44, 1.58, 0.02])
    addMuscleMesh('shoulders', deltGeom, [0.44, 1.58, 0.02])

    // 5. BICEPS (Front upper arms)
    const bicepGeom = new THREE.CapsuleGeometry(0.09, 0.22, 8, 16)
    addMuscleMesh('biceps', bicepGeom, [-0.43, 1.30, 0.05], [0.1, 0, -0.08])
    addMuscleMesh('biceps', bicepGeom, [0.43, 1.30, 0.05], [0.1, 0, 0.08])

    // 6. TRICEPS (Back upper arms)
    const tricepGeom = new THREE.CapsuleGeometry(0.09, 0.22, 8, 16)
    addMuscleMesh('triceps', tricepGeom, [-0.43, 1.30, -0.06], [-0.1, 0, -0.08])
    addMuscleMesh('triceps', tricepGeom, [0.43, 1.30, -0.06], [-0.1, 0, 0.08])

    // 7. FOREARMS
    const forearmGeom = new THREE.CylinderGeometry(0.08, 0.06, 0.34, 16)
    addMuscleMesh('forearms', forearmGeom, [-0.46, 0.95, 0.04], [0.1, 0, -0.05])
    addMuscleMesh('forearms', forearmGeom, [0.46, 0.95, 0.04], [0.1, 0, 0.05])

    // 8. BACK: TRAPS (Trapezius upper back)
    const trapsGeom = new THREE.BoxGeometry(0.38, 0.24, 0.12)
    addMuscleMesh('back_traps', trapsGeom, [0, 1.62, -0.08], [0.1, 0, 0])

    // 9. BACK: LATS (Latissimus Dorsi V-Taper)
    const latsGeom = new THREE.BoxGeometry(0.22, 0.34, 0.12)
    addMuscleMesh('back_lats', latsGeom, [-0.18, 1.32, -0.09], [0, 0, -0.18])
    addMuscleMesh('back_lats', latsGeom, [0.18, 1.32, -0.09], [0, 0, 0.18])

    // 10. BACK: LOWER ERECTORS
    const lowerBackGeom = new THREE.BoxGeometry(0.24, 0.26, 0.1)
    addMuscleMesh('back_lower', lowerBackGeom, [0, 0.98, -0.08])

    // 11. GLUTES (Gluteus Maximus Left & Right)
    const gluteGeom = new THREE.SphereGeometry(0.18, 16, 16)
    gluteGeom.scale(1.1, 1.1, 1.2)
    addMuscleMesh('glutes', gluteGeom, [-0.16, 0.52, -0.12])
    addMuscleMesh('glutes', gluteGeom, [0.16, 0.52, -0.12])

    // 12. QUADS (Front Thighs)
    const quadGeom = new THREE.CapsuleGeometry(0.13, 0.42, 8, 16)
    addMuscleMesh('quads', quadGeom, [-0.19, 0.08, 0.06], [-0.08, 0, -0.04])
    addMuscleMesh('quads', quadGeom, [0.19, 0.08, 0.06], [-0.08, 0, 0.04])

    // 13. HAMSTRINGS (Back Thighs)
    const hamGeom = new THREE.CapsuleGeometry(0.12, 0.4, 8, 16)
    addMuscleMesh('hamstrings', hamGeom, [-0.19, 0.08, -0.08], [0.08, 0, -0.04])
    addMuscleMesh('hamstrings', hamGeom, [0.19, 0.08, -0.08], [0.08, 0, 0.04])

    // Knee joints
    const kneeGeom = new THREE.SphereGeometry(0.08, 12, 12)
    const leftKnee = new THREE.Mesh(kneeGeom, boneMaterial)
    leftKnee.position.set(-0.19, -0.25, 0)
    const rightKnee = new THREE.Mesh(kneeGeom, boneMaterial)
    rightKnee.position.set(0.19, -0.25, 0)
    scene.add(leftKnee, rightKnee)

    // 14. CALVES (Gastrocnemius Left & Right)
    const calfGeom = new THREE.CapsuleGeometry(0.11, 0.36, 8, 16)
    addMuscleMesh('calves', calfGeom, [-0.19, -0.58, -0.02], [0, 0, -0.02])
    addMuscleMesh('calves', calfGeom, [0.19, -0.58, -0.02], [0, 0, 0.02])

    // Feet
    const footGeom = new THREE.BoxGeometry(0.12, 0.08, 0.24)
    const leftFoot = new THREE.Mesh(footGeom, boneMaterial)
    leftFoot.position.set(-0.19, -0.92, 0.06)
    const rightFoot = new THREE.Mesh(footGeom, boneMaterial)
    rightFoot.position.set(0.19, -0.92, 0.06)
    scene.add(leftFoot, rightFoot)

    // --- CYBERNETIC HOLOPODIUM FLOOR ---
    const floorRingGeom = new THREE.RingGeometry(0.8, 1.4, 32)
    const floorRingMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35,
    })
    const floorRing = new THREE.Mesh(floorRingGeom, floorRingMat)
    floorRing.rotation.x = -Math.PI / 2
    floorRing.position.y = -0.96
    scene.add(floorRing)

    const floorGrid = new THREE.GridHelper(3.2, 16, 0x06b6d4, 0x1e293b)
    floorGrid.position.y = -0.96
    scene.add(floorGrid)
  }

  // Update dynamic colors whenever fatigueLevels change
  useEffect(() => {
    muscleMeshesRef.current.forEach((meshes, key) => {
      const fatigue = fatigueLevels[key] ?? MUSCLE_REGISTRY[key]?.defaultFatigue ?? 50
      const colorHex = getFatigueColorHex(fatigue)
      const isSelected = selectedMuscleKey === key

      meshes.forEach((mesh) => {
        const mat = mesh.material as THREE.MeshStandardMaterial
        if (mat) {
          mat.emissive.set(colorHex)
          mat.emissiveIntensity = isSelected ? 1.6 : 0.75
          if (isSelected) {
            mat.color.set('#38bdf8')
          } else {
            mat.color.set('#141824')
          }
        }
      })
    })
  }, [fatigueLevels, selectedMuscleKey])

  // Handle Camera Presets with smooth animation
  useEffect(() => {
    if (!cameraRef.current || !controlsRef.current || !cameraPreset) return

    const cam = cameraRef.current
    const controls = controlsRef.current

    let targetPos = new THREE.Vector3(0, 0.6, 3.8)
    let lookTarget = new THREE.Vector3(0, 0.6, 0)

    if (cameraPreset === 'front') {
      targetPos.set(0, 0.6, 3.8)
      lookTarget.set(0, 0.6, 0)
    } else if (cameraPreset === 'back') {
      targetPos.set(0, 0.6, -3.8)
      lookTarget.set(0, 0.6, 0)
    } else if (cameraPreset === 'iso') {
      targetPos.set(2.8, 1.4, 3.0)
      lookTarget.set(0, 0.6, 0)
    } else if (cameraPreset === 'upper') {
      targetPos.set(0, 1.35, 2.3)
      lookTarget.set(0, 1.35, 0)
    } else if (cameraPreset === 'lower') {
      targetPos.set(0, -0.2, 2.5)
      lookTarget.set(0, -0.2, 0)
    }

    cam.position.copy(targetPos)
    controls.target.copy(lookTarget)
    controls.update()
  }, [cameraPreset])

  // Setup Three.js scene, renderer, controls, and raycasting
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Scene
    const scene = new THREE.Scene()
    scene.background = null // Transparent so CSS background shines through
    sceneRef.current = scene

    // Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    )
    camera.position.set(0, 0.6, 3.8)
    cameraRef.current = camera

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.shadowMap.enabled = true
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.15
    container.innerHTML = ''
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.minDistance = 1.5
    controls.maxDistance = 6.0
    controls.maxPolarAngle = Math.PI / 2 + 0.1
    controls.target.set(0, 0.6, 0)
    controlsRef.current = controls

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
    scene.add(ambientLight)

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.8)
    keyLight.position.set(2.5, 4, 3.5)
    keyLight.castShadow = true
    scene.add(keyLight)

    const rimLightBack = new THREE.DirectionalLight(0x06b6d4, 2.2)
    rimLightBack.position.set(-2, 3, -3.5)
    scene.add(rimLightBack)

    const fillLight = new THREE.DirectionalLight(0x8b5cf6, 1.2)
    fillLight.position.set(-3, 0.5, 2)
    scene.add(fillLight)

    // Build the anatomical body
    buildAnatomicalMannequin(scene)

    // Raycasting for interactive hover and click
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()

    const handlePointerMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect()
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1

      raycaster.setFromCamera(mouse, camera)
      const allMeshes: THREE.Mesh[] = []
      muscleMeshesRef.current.forEach((meshes) => allMeshes.push(...meshes))

      const intersects = raycaster.intersectObjects(allMeshes)
      if (intersects.length > 0) {
        const hitKey = intersects[0].object.userData.muscleKey
        if (hitKey && MUSCLE_REGISTRY[hitKey]) {
          container.style.cursor = 'pointer'
          setHoveredMuscle(MUSCLE_REGISTRY[hitKey])
          setHoverPos({ x: e.clientX, y: e.clientY })
          return
        }
      }
      container.style.cursor = 'grab'
      setHoveredMuscle(null)
      setHoverPos(null)
    }

    const handleClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect()
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1

      raycaster.setFromCamera(mouse, camera)
      const allMeshes: THREE.Mesh[] = []
      muscleMeshesRef.current.forEach((meshes) => allMeshes.push(...meshes))

      const intersects = raycaster.intersectObjects(allMeshes)
      if (intersects.length > 0) {
        const hitKey = intersects[0].object.userData.muscleKey
        if (hitKey) {
          onSelectMuscle(hitKey)
        }
      }
    }

    renderer.domElement.addEventListener('mousemove', handlePointerMove)
    renderer.domElement.addEventListener('click', handleClick)

    // Window Resize Handler
    const handleResize = () => {
      if (!container || !camera || !renderer) return
      camera.aspect = container.clientWidth / container.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(container.clientWidth, container.clientHeight)
    }
    window.addEventListener('resize', handleResize)

    // Animation Loop
    const animate = () => {
      reqIdRef.current = requestAnimationFrame(animate)

      if (controls) {
        controls.autoRotate = isAutoRotate
        controls.autoRotateSpeed = 1.2
        controls.update()
      }

      renderer.render(scene, camera)
    }
    animate()

    // Cleanup
    return () => {
      cancelAnimationFrame(reqIdRef.current)
      window.removeEventListener('resize', handleResize)
      if (renderer.domElement) {
        renderer.domElement.removeEventListener('mousemove', handlePointerMove)
        renderer.domElement.removeEventListener('click', handleClick)
      }
      renderer.dispose()
      if (container) {
        container.innerHTML = ''
      }
    }
  }, [isAutoRotate])

  return (
    <div className="canvas-wrapper" ref={containerRef}>
      {/* Floating Hover Tooltip */}
      {hoveredMuscle && hoverPos && (
        <div
          className="heatmap-hud-tooltip"
          style={{
            left: `${hoverPos.x + 18}px`,
            top: `${hoverPos.y - 30}px`,
          }}
        >
          <div className="tooltip-header">
            <span className="tooltip-title">{hoveredMuscle.name}</span>
            <span
              className="tooltip-fatigue-badge"
              style={{
                background: getFatigueColorHex(
                  fatigueLevels[hoveredMuscle.key] ?? hoveredMuscle.defaultFatigue
                ),
              }}
            >
              {fatigueLevels[hoveredMuscle.key] ?? hoveredMuscle.defaultFatigue}% Fatigue
            </span>
          </div>
          <span className="tooltip-sub">Click to inspect recovery intel</span>
        </div>
      )}
    </div>
  )
}
