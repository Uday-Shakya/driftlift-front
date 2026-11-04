'use client'

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import styles from './AuthGateScreen.module.css'
import {
  IoCameraOutline,
  IoSparkles,
  IoFitnessOutline,
  IoLockClosedOutline,
  IoMailOutline,
  IoPersonOutline,
  IoEyeOutline,
  IoEyeOffOutline,
  IoArrowForward,
  IoShieldCheckmarkOutline,
  IoFlameOutline,
  IoSpeedometerOutline
} from 'react-icons/io5'
import { toast } from 'react-toastify'

interface AuthGateScreenProps {
  initialMode?: 'login' | 'signup'
  featureName?: string
  redirectPath?: string
  onSuccess?: () => void
}

export default function AuthGateScreen({
  initialMode = 'login',
  featureName,
  redirectPath,
  onSuccess,
}: AuthGateScreenProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, register, checkLogin, isLoggedIn } = useAuth()

  const [mode, setMode] = useState<'login' | 'signup'>(initialMode)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  // Login form state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Signup form state
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [weightKg, setWeightKg] = useState('72')
  const [heightCm, setHeightCm] = useState('175')
  const [gender, setGender] = useState('male')
  const [goal, setGoal] = useState('weightLoss')
  const [activityLevel, setActivityLevel] = useState('moderate')
  const [dob, setDob] = useState('2000-01-01')

  const targetRedirect = redirectPath || searchParams?.get('redirect') || ''

  const navigateAfterAuth = () => {
    if (onSuccess) {
      onSuccess()
      return
    }
    const dest =
      targetRedirect && targetRedirect !== '/login' && targetRedirect !== '/signup'
        ? targetRedirect
        : '/'
    if (typeof window !== 'undefined') {
      window.location.href = dest
    } else {
      router.push(dest)
    }
  }

  // If already authenticated and sitting on /login or /signup, redirect immediately
  React.useEffect(() => {
    if (isLoggedIn) {
      if (typeof window !== 'undefined' && (window.location.pathname === '/login' || window.location.pathname === '/signup')) {
        const dest =
          targetRedirect && targetRedirect !== '/login' && targetRedirect !== '/signup'
            ? targetRedirect
            : '/'
        window.location.href = dest
      }
    }
  }, [isLoggedIn, targetRedirect])

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedEmail = loginEmail.trim()
    if (!trimmedEmail || !loginPassword) {
      toast.warn('Please fill in both email and password')
      return
    }

    setLoading(true)
    const res = await login(trimmedEmail, loginPassword)
    setLoading(false)

    if (res.ok) {
      toast.success(res.message || 'Welcome back to DriftLift Pro!')
      await checkLogin()
      navigateAfterAuth()
    } else {
      toast.error(res.message || 'Login failed')
    }
  }

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedEmail = email.trim()
    const trimmedName = name.trim()
    if (!trimmedName || !trimmedEmail || !password) {
      toast.warn('Name, email and password are required')
      return
    }

    setLoading(true)
    const payload = {
      name: trimmedName,
      email: trimmedEmail,
      password,
      weightInKg: parseFloat(weightKg) || 70,
      heightInCm: parseFloat(heightCm) || 175,
      gender,
      dob,
      goal,
      activityLevel,
    }

    const res = await register(payload)
    setLoading(false)

    if (res.ok) {
      toast.success('Athlete account created! Signing you in...')
      // Auto login right after registration
      const loginRes = await login(trimmedEmail, password)
      if (loginRes.ok) {
        await checkLogin()
        navigateAfterAuth()
      } else {
        setMode('login')
        setLoginEmail(trimmedEmail)
      }
    } else {
      toast.error(res.message || 'Registration failed')
    }
  }

  return (
    <div className={styles.gateWrapper}>
      <div className={styles.backgroundGlowTop} />
      <div className={styles.backgroundGlowBottom} />

      <div className={styles.container}>
        {/* Left Column: Pro Fitness Value Proposition */}
        <div className={styles.infoColumn}>
          <div className={styles.pillBadge}>
            <span className={styles.pillDot} />
            <span>Member Access Required</span>
          </div>

          <h1 className={styles.mainTitle}>
            Unlock the DriftLift <span className={styles.highlightText}>Performance Suite</span>.
          </h1>

          <p className={styles.subtitle}>
            Without an active athlete account, advanced real-time biometric metrics, AI posture
            tracking, and customized recovery heatmaps remain inaccessible.
          </p>

          <div className={styles.featuresList}>
            <div className={styles.featureItem}>
              <div className={`${styles.featureIconBox} ${styles.featureIconGreen}`}>
                <IoCameraOutline />
              </div>
              <div className={styles.featureDetails}>
                <span className={styles.featureTitle}>AI Optical Rep Counter</span>
                <span className={styles.featureDesc}>
                  Real-time skeletal angle detection and audio cadence feedback via your camera.
                </span>
              </div>
            </div>

            <div className={styles.featureItem}>
              <div className={`${styles.featureIconBox} ${styles.featureIconCyan}`}>
                <IoSparkles />
              </div>
              <div className={styles.featureDetails}>
                <span className={styles.featureTitle}>3D Kinetic Fatigue Heatmap</span>
                <span className={styles.featureDesc}>
                  Interactive DOMS recovery mapping across all 14 major muscle regions.
                </span>
              </div>
            </div>

            <div className={styles.featureItem}>
              <div className={`${styles.featureIconBox} ${styles.featureIconAmber}`}>
                <IoFitnessOutline />
              </div>
              <div className={styles.featureDetails}>
                <span className={styles.featureTitle}>HD Form Tutorials & Analytics</span>
                <span className={styles.featureDesc}>
                  Step-by-step biomechanical guides, daily macro trends, and BMR/TDEE tracking.
                </span>
              </div>
            </div>
          </div>

          <div className={styles.trustRow}>
            <div className={styles.trustStat}>
              <span className={styles.trustVal}>5,000+</span>
              <span className={styles.trustLabel}>Athletes Active</span>
            </div>
            <div className={styles.trustStat}>
              <span className={styles.trustVal}>Zero Ads</span>
              <span className={styles.trustLabel}>Clean Interface</span>
            </div>
            <div className={styles.trustStat}>
              <span className={styles.trustVal}>100% Free</span>
              <span className={styles.trustLabel}>Core Platform</span>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Login / Register Form */}
        <div className={styles.authCard}>
          {featureName && (
            <div className={styles.contextBanner}>
              <IoLockClosedOutline />
              <span>
                <strong>{featureName}</strong> is locked. Sign in or register below to gain instant
                access.
              </span>
            </div>
          )}

          {/* Tab Switcher */}
          <div className={styles.tabSwitcher}>
            <button
              type="button"
              className={`${styles.tabBtn} ${mode === 'login' ? styles.tabBtnActive : ''}`}
              onClick={() => setMode('login')}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`${styles.tabBtn} ${mode === 'signup' ? styles.tabBtnActive : ''}`}
              onClick={() => setMode('signup')}
            >
              Create Account
            </button>
          </div>

          {/* Form Content */}
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Email Address</label>
                <div className={styles.inputWrapper}>
                  <IoMailOutline className={styles.inputIcon} />
                  <input
                    type="email"
                    required
                    placeholder="athlete@driftlift.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className={styles.input}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Password</label>
                <div className={styles.inputWrapper}>
                  <IoLockClosedOutline className={styles.inputIcon} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className={styles.input}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={styles.passwordToggle}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className={styles.submitBtn}>
                {loading ? (
                  <div className={styles.loadingSpinner} />
                ) : (
                  <>
                    <span>Unlock DriftLift Pro</span>
                    <IoArrowForward />
                  </>
                )}
              </button>

              <p className={styles.switchPrompt}>
                New to the platform?
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className={styles.switchLink}
                >
                  Create an account
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleSignupSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Full Name</label>
                <div className={styles.inputWrapper}>
                  <IoPersonOutline className={styles.inputIcon} />
                  <input
                    type="text"
                    required
                    placeholder="Alex Walker"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={styles.input}
                    autoComplete="name"
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Email Address</label>
                <div className={styles.inputWrapper}>
                  <IoMailOutline className={styles.inputIcon} />
                  <input
                    type="email"
                    required
                    placeholder="athlete@driftlift.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={styles.input}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Password</label>
                <div className={styles.inputWrapper}>
                  <IoLockClosedOutline className={styles.inputIcon} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={styles.input}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={styles.passwordToggle}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
                  </button>
                </div>
              </div>

              {/* Physical baseline parameters */}
              <div className={styles.formGrid2}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Weight (kg)</label>
                  <input
                    type="number"
                    min="30"
                    max="250"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    className={styles.input}
                    style={{ paddingLeft: '14px' }}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Height (cm)</label>
                  <input
                    type="number"
                    min="100"
                    max="250"
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value)}
                    className={styles.input}
                    style={{ paddingLeft: '14px' }}
                  />
                </div>
              </div>

              <div className={styles.formGrid2}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Fitness Goal</label>
                  <select
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    className={styles.select}
                  >
                    <option value="weightLoss">Fat Loss & Cut</option>
                    <option value="muscleGain">Hypertrophy / Muscle Gain</option>
                    <option value="strength">Raw Strength</option>
                    <option value="endurance">Stamina & Cardio</option>
                    <option value="maintenance">Health Maintenance</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Activity Level</label>
                  <select
                    value={activityLevel}
                    onChange={(e) => setActivityLevel(e.target.value)}
                    className={styles.select}
                  >
                    <option value="sedentary">Desk Job / Sedentary</option>
                    <option value="light">Light (1-2 days/wk)</option>
                    <option value="moderate">Moderate (3-5 days/wk)</option>
                    <option value="heavy">Intense (6-7 days/wk)</option>
                  </select>
                </div>
              </div>

              <button type="submit" disabled={loading} className={styles.submitBtn}>
                {loading ? (
                  <div className={styles.loadingSpinner} />
                ) : (
                  <>
                    <span>Create Free Account</span>
                    <IoShieldCheckmarkOutline />
                  </>
                )}
              </button>

              <p className={styles.switchPrompt}>
                Already an athlete?
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className={styles.switchLink}
                >
                  Sign in here
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

