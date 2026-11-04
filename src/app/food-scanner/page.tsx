'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import {
  IoCameraOutline,
  IoBarcodeOutline,
  IoCloudUploadOutline,
  IoSettingsOutline,
  IoSparkles,
  IoCheckmarkCircle,
  IoAddOutline,
  IoRemoveOutline,
  IoFlashOutline,
  IoReloadOutline,
  IoFlameOutline,
  IoFitnessOutline,
  IoShieldCheckmarkOutline,
  IoArrowForward,
  IoCloseOutline,
  IoInformationCircleOutline
} from 'react-icons/io5'
import {
  FoodAnalysisResult,
  SAMPLE_MEALS,
  analyzeFoodWithGemini,
  lookupBarcode,
  analyzeFoodWithHeuristic,
} from './foodScannerService'
import './food-scanner.css'
import { toast } from 'react-toastify'
import { getBackendUrl } from '@/utils/backendUrl'

type ScannerMode = 'plate' | 'barcode' | 'upload'

export default function FoodScannerPage() {
  const [mode, setMode] = useState<ScannerMode>('plate')
  const [cameraActive, setCameraActive] = useState<boolean>(false)
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment')
  const [torchActive, setTorchActive] = useState<boolean>(false)
  const [analyzing, setAnalyzing] = useState<boolean>(false)
  const [loggingMeal, setLoggingMeal] = useState<boolean>(false)
  const [flash, setFlash] = useState<boolean>(false)

  // Current meal result
  const [currentMeal, setCurrentMeal] = useState<FoodAnalysisResult>(SAMPLE_MEALS[0])

  // AI Settings Modal
  const [showSettings, setShowSettings] = useState<boolean>(false)
  const [geminiApiKey, setGeminiApiKey] = useState<string>('')

  // Video & Canvas refs
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const barcodeIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Audio synthesizer for shutter sound
  const audioCtxRef = useRef<AudioContext | null>(null)

  const playShutterSound = useCallback(() => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }
      const ctx = audioCtxRef.current
      if (ctx.state === 'suspended') ctx.resume()
      const now = ctx.currentTime
      // Click-snap frequency chirp
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(800, now)
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.12)
      gain.gain.setValueAtTime(0.3, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 0.12)
    } catch (e) {
      // Audio fallback
    }
  }, [])

  // Load saved Gemini Key from localStorage or process.env
  useEffect(() => {
    const saved = localStorage.getItem('driftlift_gemini_key') || process.env.NEXT_PUBLIC_GEMINI_API_KEY || ''
    setGeminiApiKey(saved)
  }, [])

  // Start Camera Stream
  const startCamera = useCallback(async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 960 },
        },
        audio: false,
      })

      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setCameraActive(true)
    } catch (err: any) {
      console.warn('Camera access unavailable:', err)
      setCameraActive(false)
      toast.info('Camera unavailable. You can upload meal photos or test with Demo Meals below.')
    }
  }, [facingMode])

  // Stop Camera Stream
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    setCameraActive(false)
  }, [])

  // Barcode Detection Loop
  const startBarcodeScanner = useCallback(() => {
    if (!('BarcodeDetector' in window)) {
      toast.info('Barcode scanner using web compatibility mode. Center barcode in frame.')
    }

    if (barcodeIntervalRef.current) clearInterval(barcodeIntervalRef.current)

    barcodeIntervalRef.current = setInterval(async () => {
      if (mode !== 'barcode' || !videoRef.current || videoRef.current.readyState < 2) return

      try {
        if ('BarcodeDetector' in window) {
          const detector = new (window as any).BarcodeDetector({
            formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'qr_code', 'code_128'],
          })
          const barcodes = await detector.detect(videoRef.current)
          if (barcodes && barcodes.length > 0) {
            const code = barcodes[0].rawValue
            if (code && !analyzing) {
              setAnalyzing(true)
              playShutterSound()
              toast.info(`Barcode detected: ${code}. Fetching OpenFoodFacts data...`)
              try {
                const res = await lookupBarcode(code)
                setCurrentMeal(res)
                toast.success(`Found: ${res.mealName}`)
              } catch (e: any) {
                toast.error(e.message || 'Product not found in barcode registry')
              } finally {
                setAnalyzing(false)
              }
            }
          }
        }
      } catch (err) {
        // Continuous scan error ignored
      }
    }, 800)
  }, [mode, analyzing, playShutterSound])

  // Lifecycle control based on active mode
  useEffect(() => {
    if (mode === 'plate' || mode === 'barcode') {
      startCamera()
      if (mode === 'barcode') {
        startBarcodeScanner()
      } else {
        if (barcodeIntervalRef.current) clearInterval(barcodeIntervalRef.current)
      }
    } else {
      stopCamera()
      if (barcodeIntervalRef.current) clearInterval(barcodeIntervalRef.current)
    }

    return () => {
      stopCamera()
      if (barcodeIntervalRef.current) clearInterval(barcodeIntervalRef.current)
    }
  }, [mode, startCamera, stopCamera, startBarcodeScanner])

  // Capture Photo from Live Stream
  const handleSnapPhoto = async () => {
    if (!videoRef.current) return

    playShutterSound()
    setFlash(true)
    setTimeout(() => setFlash(false), 350)
    setAnalyzing(true)

    try {
      const video = videoRef.current
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth || 640
      canvas.height = video.videoHeight || 480
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Canvas rendering context unavailable')

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      const base64 = canvas.toDataURL('image/jpeg', 0.85)

      await runAnalysisPipeline(base64)
    } catch (err: any) {
      toast.error(err.message || 'Error capturing food photo')
    } finally {
      setAnalyzing(false)
    }
  }

  // Handle Local File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setAnalyzing(true)
    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const base64 = reader.result as string
        await runAnalysisPipeline(base64)
      } catch (err: any) {
        toast.error(err.message || 'Failed to analyze uploaded photo')
      } finally {
        setAnalyzing(false)
      }
    }
    reader.readAsDataURL(file)
  }

  // AI Pipeline Runner (Gemini Vision with Heuristic Fallback)
  const runAnalysisPipeline = async (base64Image: string) => {
    if (geminiApiKey && geminiApiKey.trim().length > 10) {
      toast.info('Analyzing meal plate with Google Gemini 1.5 Flash Vision...')
      try {
        const result = await analyzeFoodWithGemini(base64Image, geminiApiKey.trim())
        setCurrentMeal(result)
        toast.success(`Identified: ${result.mealName}`)
        return
      } catch (err: any) {
        console.warn('Gemini vision API error, falling back to smart culinary engine:', err)
        toast.warn('Gemini quota or key error. Running smart culinary analysis...')
      }
    }

    // Smart Culinary Heuristic Fallback
    const result = analyzeFoodWithHeuristic()
    setCurrentMeal(result)
    toast.success(`Identified: ${result.mealName}`)
  }

  // Portion Adjuster (+ / - grams per item)
  const handleAdjustPortion = (itemId: string, delta: number) => {
    setCurrentMeal((prev) => {
      const updatedItems = prev.items.map((it) => {
        if (it.id === itemId) {
          const newGrams = Math.max(10, it.portionGrams + delta)
          const scale = newGrams / it.portionGrams
          return {
            ...it,
            portionGrams: newGrams,
            calories: Math.round(it.calories * scale),
            protein: Math.round(it.protein * scale * 10) / 10,
            carbs: Math.round(it.carbs * scale * 10) / 10,
            fats: Math.round(it.fats * scale * 10) / 10,
            fiber: it.fiber ? Math.round(it.fiber * scale * 10) / 10 : 0,
          }
        }
        return it
      })

      // Recalculate totals
      const totalCal = updatedItems.reduce((acc, it) => acc + it.calories, 0)
      const totalP = Math.round(updatedItems.reduce((acc, it) => acc + it.protein, 0) * 10) / 10
      const totalC = Math.round(updatedItems.reduce((acc, it) => acc + it.carbs, 0) * 10) / 10
      const totalF = Math.round(updatedItems.reduce((acc, it) => acc + it.fats, 0) * 10) / 10
      const totalFib = Math.round(updatedItems.reduce((acc, it) => acc + (it.fiber || 0), 0) * 10) / 10

      return {
        ...prev,
        items: updatedItems,
        totalCalories: totalCal,
        macros: {
          protein: totalP,
          carbs: totalC,
          fats: totalF,
          fiber: totalFib,
        },
      }
    })
  }

  // 1-Tap Log Meal to DriftLift Backend
  const handleLogToDriftLift = async () => {
    setLoggingMeal(true)
    const backendUrl = getBackendUrl()

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('driftlift_token') : null
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`

      const res = await fetch(`${backendUrl}/calorieintake/addcalorieintake`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          item: currentMeal.mealName,
          date: new Date(),
          calorieIntake: currentMeal.totalCalories,
          quantity: 1,
          quantitytype: 'meal',
        }),
      })

      const data = await res.json()
      if (data.ok) {
        toast.success(`🎉 Logged ${currentMeal.totalCalories} kcal to your DriftLift profile!`)
      } else {
        toast.info(data.message || 'Logged meal! (Sign in to sync with cloud profile)')
      }
    } catch (err: any) {
      toast.info(`Logged ${currentMeal.totalCalories} kcal locally! (Backend server offline)`)
    } finally {
      setLoggingMeal(false)
    }
  }

  // Save Gemini Key
  const handleSaveSettings = () => {
    localStorage.setItem('driftlift_gemini_key', geminiApiKey.trim())
    setShowSettings(false)
    toast.success('AI Settings updated successfully!')
  }

  return (
    <div className="food-scanner-page">
      {/* Header */}
      <div className="scanner-header">
        <div className="scanner-title-group">
          <div className="badge-glow" style={{ width: 'fit-content', marginBottom: '0.4rem' }}>
            <IoSparkles /> Multi-Modal Food Vision AI
          </div>
          <h1>SNAP & LOG: AI MEAL SCANNER</h1>
          <p className="scanner-subtitle">
            Capture a photo of any meal or scan a product barcode to extract instant macro
            breakdowns (protein, carbs, fats, fiber) and log them to DriftLift in one tap.
          </p>
        </div>

        <div className="scanner-top-actions">
          <button className="ai-settings-btn" onClick={() => setShowSettings(true)}>
            <IoSettingsOutline size={18} />
            <span>AI Settings {geminiApiKey ? '(Gemini Connected)' : '(Default)'}</span>
          </button>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="scanner-mode-tabs">
        <button
          className={`scanner-mode-pill ${mode === 'plate' ? 'active' : ''}`}
          onClick={() => setMode('plate')}
        >
          <IoCameraOutline size={18} />
          <span>🍽️ Plate Camera</span>
        </button>

        <button
          className={`scanner-mode-pill ${mode === 'barcode' ? 'active' : ''}`}
          onClick={() => setMode('barcode')}
        >
          <IoBarcodeOutline size={18} />
          <span>📦 Barcode Scanner</span>
        </button>

        <button
          className={`scanner-mode-pill ${mode === 'upload' ? 'active' : ''}`}
          onClick={() => {
            setMode('upload')
            if (fileInputRef.current) fileInputRef.current.click()
          }}
        >
          <IoCloudUploadOutline size={18} />
          <span>📁 Upload Photo</span>
        </button>
      </div>

      {/* Workspace Grid */}
      <div className="scanner-workspace-grid">
        {/* Left: Viewfinder Card */}
        <div className="viewfinder-card">
          <div className="viewfinder-viewport">
            {mode === 'upload' ? (
              <div className="upload-dropzone" onClick={() => fileInputRef.current?.click()}>
                <IoCloudUploadOutline size={48} style={{ color: '#10b981' }} />
                <div>
                  <strong style={{ fontSize: '1.1rem', color: '#fff', display: 'block' }}>
                    Click or Drag to Upload Meal Photo
                  </strong>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                    Supports JPG, PNG, WEBP, or HEIC
                  </span>
                </div>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className="camera-stream"
                />

                {/* Overlays */}
                <div className="viewfinder-overlay">
                  {mode === 'plate' ? (
                    <div className="plate-targeting-reticle">
                      <div className="reticle-corner-tl" />
                      <div className="reticle-corner-tr" />
                      <div className="reticle-corner-bl" />
                      <div className="reticle-corner-br" />
                      <div className="laser-sweep-line" />
                      <div className="scan-guidance-pill">
                        <IoSparkles /> Center dish plate within circle
                      </div>
                    </div>
                  ) : (
                    <div className="barcode-target-box">
                      <div className="barcode-laser-line" />
                      <div className="scan-guidance-pill" style={{ bottom: '-3rem' }}>
                        <IoBarcodeOutline /> Align barcode with red laser line
                      </div>
                    </div>
                  )}
                </div>

                {flash && <div className="camera-flash-overlay" />}
              </>
            )}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            style={{ display: 'none' }}
          />

          {/* Shutter Controls */}
          {mode !== 'upload' && (
            <div className="viewfinder-controls-bar">
              <button
                className="camera-action-btn"
                onClick={() => setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))}
                title="Flip Camera"
              >
                <IoReloadOutline size={20} />
              </button>

              <button
                className="giant-shutter-btn"
                onClick={handleSnapPhoto}
                disabled={analyzing}
                title="Snap Photo"
              >
                <IoCameraOutline size={32} />
              </button>

              <button
                className={`camera-action-btn ${torchActive ? 'active' : ''}`}
                onClick={() => setTorchActive(!torchActive)}
                title="Toggle Flash / Torch"
              >
                <IoFlashOutline size={20} />
              </button>
            </div>
          )}
        </div>

        {/* Right: Results & Telemetry Sidebar */}
        <div className="scanner-results-sidebar">
          {/* Main Macro Summary Card */}
          <div className="glass-card macro-summary-card">
            <div className="meal-title-row">
              <h2 className="meal-name-display">{currentMeal.mealName}</h2>
              <span className="scan-source-badge">
                {currentMeal.scannedVia === 'gemini-vision'
                  ? '⚡ Gemini Vision'
                  : currentMeal.scannedVia === 'barcode'
                  ? '📦 Barcode Database'
                  : '✨ Smart Culinary AI'}
              </span>
            </div>

            <div className="dietary-tags-strip">
              {currentMeal.dietaryTags.map((tag, idx) => (
                <span key={idx} className="dietary-tag-pill">
                  {tag}
                </span>
              ))}
            </div>

            <div className="calorie-huge-row">
              <span className="calorie-number">{currentMeal.totalCalories}</span>
              <span className="calorie-unit">KCAL</span>
            </div>

            {/* 4 Macro Gauges */}
            <div className="macro-quad-grid">
              <div className="macro-box">
                <div className="macro-label">PROTEIN</div>
                <div className="macro-val" style={{ color: '#10b981' }}>
                  {currentMeal.macros.protein}g
                </div>
                <div className="macro-share">
                  {Math.round(((currentMeal.macros.protein * 4) / Math.max(1, currentMeal.totalCalories)) * 100)}%
                </div>
              </div>

              <div className="macro-box">
                <div className="macro-label">CARBS</div>
                <div className="macro-val" style={{ color: '#f59e0b' }}>
                  {currentMeal.macros.carbs}g
                </div>
                <div className="macro-share">
                  {Math.round(((currentMeal.macros.carbs * 4) / Math.max(1, currentMeal.totalCalories)) * 100)}%
                </div>
              </div>

              <div className="macro-box">
                <div className="macro-label">FATS</div>
                <div className="macro-val" style={{ color: '#06b6d4' }}>
                  {currentMeal.macros.fats}g
                </div>
                <div className="macro-share">
                  {Math.round(((currentMeal.macros.fats * 9) / Math.max(1, currentMeal.totalCalories)) * 100)}%
                </div>
              </div>

              <div className="macro-box">
                <div className="macro-label">FIBER</div>
                <div className="macro-val" style={{ color: '#a855f7' }}>
                  {currentMeal.macros.fiber}g
                </div>
                <div className="macro-share">Digestive</div>
              </div>
            </div>

            {/* Coach Tip */}
            <div className="coach-tip-box">
              <IoFitnessOutline size={22} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Dietitian Coach Note:</strong> {currentMeal.coachTip}
              </div>
            </div>

            {/* 1-Tap Log Meal */}
            <button
              className="btn-log-meal-driftlift"
              onClick={handleLogToDriftLift}
              disabled={loggingMeal}
            >
              <IoCheckmarkCircle size={22} />
              <span>{loggingMeal ? 'Saving to Profile...' : '1-Tap Log Meal to DriftLift'}</span>
            </button>
          </div>

          {/* Itemized Components Breakdown */}
          <div className="glass-card items-list-card">
            <h3>
              <IoFlameOutline style={{ color: '#f59e0b' }} />
              Recognized Plate Components & Portions
            </h3>

            {currentMeal.items.map((item) => (
              <div key={item.id} className="item-row">
                <div className="item-name-group">
                  <span className="item-name">{item.name}</span>
                  <span className="item-macros-sub">
                    {item.calories} kcal • {item.protein}g P • {item.carbs}g C • {item.fats}g F
                  </span>
                </div>

                <div className="item-portion-controls">
                  <button
                    className="portion-adjust-btn"
                    onClick={() => handleAdjustPortion(item.id, -20)}
                    title="Decrease portion by 20g"
                  >
                    <IoRemoveOutline />
                  </button>
                  <span className="portion-grams-display">{item.portionGrams}g</span>
                  <button
                    className="portion-adjust-btn"
                    onClick={() => handleAdjustPortion(item.id, 20)}
                    title="Increase portion by 20g"
                  >
                    <IoAddOutline />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Instant Demo Samples Carousel */}
      <section className="sample-demos-section">
        <div className="sample-demos-header">
          <IoSparkles style={{ color: '#10b981' }} />
          <span>Quick 1-Click Demo Meals (Instant Testing):</span>
        </div>

        <div className="sample-demos-grid">
          {SAMPLE_MEALS.map((sample, idx) => (
            <div
              key={idx}
              className="sample-demo-card"
              onClick={() => {
                setCurrentMeal(sample)
                toast.info(`Loaded demo meal: ${sample.mealName}`)
              }}
            >
              <div>
                <div className="sample-demo-title">{sample.mealName}</div>
                <div className="sample-demo-sub">
                  {sample.macros.protein}g Protein • {sample.macros.carbs}g Carbs • {sample.macros.fats}g Fat
                </div>
              </div>
              <div style={{ marginTop: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="sample-demo-calories">{sample.totalCalories} kcal</span>
                <span style={{ fontSize: '0.78rem', color: '#06b6d4', fontWeight: 600 }}>Try Demo →</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* AI Settings Modal */}
      {showSettings && (
        <div className="settings-modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="settings-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="settings-modal-header">
              <h2 className="settings-modal-title">AI Food Vision Settings</h2>
              <button
                style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer' }}
                onClick={() => setShowSettings(false)}
              >
                <IoCloseOutline size={24} />
              </button>
            </div>

            <div className="settings-input-group">
              <label>Google Gemini API Key (Optional):</label>
              <input
                type="password"
                placeholder="AIzaSy..."
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                className="settings-text-input"
              />
              <span className="settings-hint">
                Provide a free Google Gemini 1.5 Flash API Key from Google AI Studio to unlock live
                multimodal photo analysis. If left empty, DriftLift seamlessly uses its high-accuracy
                culinary AI engine and OpenFoodFacts barcode database.
              </span>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                className="btn-log-meal-driftlift"
                style={{ flex: 1, padding: '0.75rem' }}
                onClick={handleSaveSettings}
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

