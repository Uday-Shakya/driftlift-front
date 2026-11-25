'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import logo from '@/app/assets/logo.png'
import {
  IoClose,
  IoMailOutline,
  IoLockClosedOutline,
  IoPersonOutline,
  IoEyeOutline,
  IoEyeOffOutline,
  IoShieldCheckmarkOutline,
  IoPlayCircleOutline,
  IoFlameOutline,
  IoCalendarOutline,
  IoArrowForward
} from 'react-icons/io5'
import { toast } from 'react-toastify'
import { useAuth } from '@/context/AuthContext'
import './AuthPopup.css'

interface AuthPopupProps {
  setShowpopup: React.Dispatch<React.SetStateAction<boolean>>
}

const AuthPopup: React.FC<AuthPopupProps> = ({ setShowpopup }) => {
  const { login, register, checkLogin } = useAuth()
  const [isSignup, setIsSignup] = useState<boolean>(false)
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)

  // Login form state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Signup form state
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [weightKg, setWeightKg] = useState('70')
  const [heightCm, setHeightCm] = useState('175')
  const [gender, setGender] = useState('male')
  const [goal, setGoal] = useState('weightLoss')
  const [activityLevel, setActivityLevel] = useState('moderate')
  const [dob, setDob] = useState('2000-01-01')

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowpopup(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [setShowpopup])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedEmail = loginEmail.trim()
    if (!trimmedEmail || !loginPassword) {
      toast.warn('Please provide email and password')
      return
    }

    setLoading(true)
    const res = await login(trimmedEmail, loginPassword)
    setLoading(false)

    if (res.ok) {
      toast.success(res.message || 'Welcome back to DriftLift!')
      setShowpopup(false)
      await checkLogin()
      if (typeof window !== 'undefined') {
        window.location.reload()
      }
    } else {
      toast.error(res.message || 'Invalid email or password')
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
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
    if (res.ok) {
      toast.success('Account created successfully! Signing you in...')
      const loginRes = await login(trimmedEmail, password)
      setLoading(false)
      if (loginRes.ok) {
        setShowpopup(false)
        await checkLogin()
        if (typeof window !== 'undefined') {
          window.location.reload()
        }
      } else {
        setIsSignup(false)
        setLoginEmail(trimmedEmail)
      }
    } else {
      setLoading(false)
      toast.error(res.message || 'Signup failed')
    }
  }

  return (
    <div className="auth-overlay" onClick={() => setShowpopup(false)}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          className="auth-close-btn"
          onClick={() => setShowpopup(false)}
          aria-label="Close auth dialog"
        >
          <IoClose size={20} />
        </button>

        <div className="auth-content-grid">
          {/* Left Brand Showcase Banner */}
          <div className="auth-brand-sidebar">
            <div>
              <div className="brand-logo-frame-modal">
                <Image src={logo} alt="DriftLift Logo" width={32} height={32} priority />
              </div>

              <div className="brand-copy-modal">
                <h2>DRIFT<span className="brand-accent">LIFT</span></h2>
                <p>The athletic operating system for precision training & biometric telemetry.</p>
              </div>

              <div className="auth-feature-pills">
                <div className="feature-pill-modal">
                  <IoPlayCircleOutline size={16} className="feature-icon-emerald" />
                  <span>HD Video Form Standards</span>
                </div>
                <div className="feature-pill-modal">
                  <IoFlameOutline size={16} className="feature-icon-amber" />
                  <span>Real-Time Macro & Water Telemetry</span>
                </div>
                <div className="feature-pill-modal">
                  <IoShieldCheckmarkOutline size={16} className="feature-icon-cyan" />
                  <span>Scientific TDEE / BMR Computation</span>
                </div>
              </div>
            </div>

            <div className="modal-sidebar-footer">
              <span className="status-live-dot" />
              <span>Zero-telemetry leak · Local-first ready</span>
            </div>
          </div>

          {/* Right Form Area */}
          <div className="auth-form-wrapper">
            {/* Segmented Tab Header Switcher */}
            <div className="auth-tab-switch">
              <button
                type="button"
                className={`auth-tab-btn ${!isSignup ? 'active' : ''}`}
                onClick={() => setIsSignup(false)}
              >
                Sign In
              </button>
              <button
                type="button"
                className={`auth-tab-btn ${isSignup ? 'active' : ''}`}
                onClick={() => setIsSignup(true)}
              >
                Create Account
              </button>
            </div>

            {!isSignup ? (
              /* LOGIN FORM */
              <form onSubmit={handleLogin} className="auth-form-body">
                <div className="form-heading-block">
                  <h3>Welcome Back</h3>
                  <p>Enter your credentials to access your athlete dashboard.</p>
                </div>

                <div className="auth-input-group">
                  <label>Email Address</label>
                  <div className="input-with-icon">
                    <IoMailOutline className="field-icon" />
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="athlete@driftlift.com"
                      required
                    />
                  </div>
                </div>

                <div className="auth-input-group">
                  <label>Password</label>
                  <div className="input-with-icon">
                    <IoLockClosedOutline className="field-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                    />
                    <button
                      type="button"
                      className="eye-toggle-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <IoEyeOffOutline size={17} /> : <IoEyeOutline size={17} />}
                    </button>
                  </div>
                </div>

                <button type="submit" className="auth-submit-btn" disabled={loading}>
                  {loading ? 'Authenticating...' : 'Sign In to DriftLift'}
                  {!loading && <IoArrowForward size={15} />}
                </button>

                <p className="auth-switch-prompt">
                  Don't have an account?{' '}
                  <button type="button" onClick={() => setIsSignup(true)} className="switch-text-btn">
                    Create an account
                  </button>
                </p>
              </form>
            ) : (
              /* SIGNUP FORM */
              <form onSubmit={handleSignup} className="auth-form-body signup-scrollable">
                <div className="form-heading-block">
                  <h3>Create Athlete Account</h3>
                  <p>Initialize your personal biometric telemetry baseline.</p>
                </div>

                <div className="auth-input-group">
                  <label>Full Name</label>
                  <div className="input-with-icon">
                    <IoPersonOutline className="field-icon" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Alex Mercer"
                      required
                    />
                  </div>
                </div>

                <div className="auth-input-group">
                  <label>Email Address</label>
                  <div className="input-with-icon">
                    <IoMailOutline className="field-icon" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex@driftlift.com"
                      required
                    />
                  </div>
                </div>

                <div className="auth-input-group">
                  <label>Password</label>
                  <div className="input-with-icon">
                    <IoLockClosedOutline className="field-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      required
                    />
                    <button
                      type="button"
                      className="eye-toggle-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <IoEyeOffOutline size={17} /> : <IoEyeOutline size={17} />}
                    </button>
                  </div>
                </div>

                <div className="two-col-inputs">
                  <div className="auth-input-group">
                    <label>Weight (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="30"
                      max="250"
                      value={weightKg}
                      onChange={(e) => setWeightKg(e.target.value)}
                      placeholder="72"
                      required
                      className="input-bare"
                    />
                  </div>
                  <div className="auth-input-group">
                    <label>Height (cm)</label>
                    <input
                      type="number"
                      min="100"
                      max="250"
                      value={heightCm}
                      onChange={(e) => setHeightCm(e.target.value)}
                      placeholder="178"
                      required
                      className="input-bare"
                    />
                  </div>
                </div>

                <div className="two-col-inputs">
                  <div className="auth-input-group">
                    <label>Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="select-bare"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="auth-input-group">
                    <label>Date of Birth</label>
                    <div className="input-with-icon">
                      <IoCalendarOutline className="field-icon" />
                      <input
                        type="date"
                        value={dob}
                        max={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setDob(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="two-col-inputs">
                  <div className="auth-input-group">
                    <label>Primary Goal</label>
                    <select
                      value={goal}
                      onChange={(e) => setGoal(e.target.value)}
                      className="select-bare"
                    >
                      <option value="weightLoss">Fat Loss & Definition</option>
                      <option value="weightGain">Hypertrophy / Muscle</option>
                      <option value="maintain">Body Recomposition</option>
                    </select>
                  </div>

                  <div className="auth-input-group">
                    <label>Activity Level</label>
                    <select
                      value={activityLevel}
                      onChange={(e) => setActivityLevel(e.target.value)}
                      className="select-bare"
                    >
                      <option value="sedentary">Sedentary</option>
                      <option value="light">Light (1-3 days/wk)</option>
                      <option value="moderate">Moderate (3-5 days/wk)</option>
                      <option value="veryActive">Intense (6-7 days/wk)</option>
                    </select>
                  </div>
                </div>

                <button type="submit" className="auth-submit-btn" disabled={loading}>
                  {loading ? 'Creating Profile...' : 'Complete Registration'}
                  {!loading && <IoArrowForward size={15} />}
                </button>

                <p className="auth-switch-prompt">
                  Already have an account?{' '}
                  <button type="button" onClick={() => setIsSignup(false)} className="switch-text-btn">
                    Sign in here
                  </button>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthPopup
