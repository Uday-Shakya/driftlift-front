'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import logo from '@/app/assets/logo.png'
import {
  IoClose,
  IoMailOutline,
  IoLockClosedOutline,
  IoPersonOutline,
  IoEyeOutline,
  IoEyeOffOutline,
  IoShieldCheckmark,
  IoPlayCircleOutline,
  IoFlameOutline
} from 'react-icons/io5'
import { toast } from 'react-toastify'
import './AuthPopup.css'

interface AuthPopupProps {
  setShowpopup: React.Dispatch<React.SetStateAction<boolean>>
}

const AuthPopup: React.FC<AuthPopupProps> = ({ setShowpopup }) => {
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

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:8000'

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch(`${backendUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      })

      const data = await res.json()
      if (data.ok) {
        toast.success(data.message || 'Welcome back to DriftLift! 🔥')
        setShowpopup(false)
        window.location.reload()
      } else {
        toast.error(data.message || 'Invalid email or password')
      }
    } catch (err) {
      toast.error('Network error connecting to auth service')
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch(`${backendUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name,
          email,
          password,
          weightInKg: parseFloat(weightKg) || 70,
          heightInCm: parseFloat(heightCm) || 175,
          gender,
          dob,
          goal,
          activityLevel,
        }),
      })

      const data = await res.json()
      if (data.ok) {
        toast.success('Account created successfully! Please sign in.')
        setIsSignup(false)
        setLoginEmail(email)
      } else {
        toast.error(data.message || 'Signup failed')
      }
    } catch (err) {
      toast.error('Network error registering account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-overlay" onClick={() => setShowpopup(false)}>
      <div className="auth-modal glass-panel" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          className="auth-close-btn"
          onClick={() => setShowpopup(false)}
          aria-label="Close auth dialog"
        >
          <IoClose size={22} />
        </button>

        <div className="auth-content-grid">
          {/* Left Brand Showcase Banner */}
          <div className="auth-brand-sidebar">
            <div className="brand-glow-halo">
              <Image src={logo} alt="DriftLift Logo" width={68} height={68} priority />
            </div>

            <div className="brand-copy">
              <h2>DRIFT<span className="brand-accent">LIFT</span></h2>
              <p>Your Ultimate Biometric & Workout Progression Platform</p>
            </div>

            <div className="auth-feature-pills">
              <div className="feature-pill">
                <IoPlayCircleOutline size={18} />
                <span>HD Video Form Tutorials</span>
              </div>
              <div className="feature-pill">
                <IoFlameOutline size={18} />
                <span>Real-Time Macro & Water Log</span>
              </div>
              <div className="feature-pill">
                <IoShieldCheckmark size={18} />
                <span>Scientific TDEE Calculation</span>
              </div>
            </div>
          </div>

          {/* Right Form Area */}
          <div className="auth-form-wrapper">
            {/* Tab Header Switcher */}
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
                  <p>Enter your credentials to access your fitness dashboard</p>
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
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      className="eye-toggle-btn"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <IoEyeOffOutline size={18} /> : <IoEyeOutline size={18} />}
                    </button>
                  </div>
                </div>

                <button type="submit" className="btn-primary auth-submit-btn" disabled={loading}>
                  {loading ? 'Authenticating...' : 'Sign In to DriftLift'}
                </button>

                <p className="auth-switch-prompt">
                  Don't have an account?{' '}
                  <button type="button" onClick={() => setIsSignup(true)} className="switch-text-btn">
                    Create one now
                  </button>
                </p>
              </form>
            ) : (
              /* SIGNUP FORM */
              <form onSubmit={handleSignup} className="auth-form-body signup-scrollable">
                <div className="form-heading-block">
                  <h3>Join the Movement</h3>
                  <p>Start your personalized journey with science-backed metrics</p>
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
                      placeholder="At least 6 characters"
                      required
                    />
                    <button
                      type="button"
                      className="eye-toggle-btn"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <IoEyeOffOutline size={18} /> : <IoEyeOutline size={18} />}
                    </button>
                  </div>
                </div>

                <div className="two-col-inputs">
                  <div className="auth-input-group">
                    <label>Weight (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={weightKg}
                      onChange={(e) => setWeightKg(e.target.value)}
                      placeholder="72"
                      required
                    />
                  </div>
                  <div className="auth-input-group">
                    <label>Height (cm)</label>
                    <input
                      type="number"
                      value={heightCm}
                      onChange={(e) => setHeightCm(e.target.value)}
                      placeholder="178"
                      required
                    />
                  </div>
                </div>

                <div className="two-col-inputs">
                  <div className="auth-input-group">
                    <label>Gender</label>
                    <select value={gender} onChange={(e) => setGender(e.target.value)}>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="auth-input-group">
                    <label>Date of Birth</label>
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="auth-input-group">
                  <label>Primary Fitness Goal</label>
                  <select value={goal} onChange={(e) => setGoal(e.target.value)}>
                    <option value="weightLoss">Fat Loss & Definition</option>
                    <option value="weightGain">Muscle Hypertrophy / Bulking</option>
                    <option value="maintain">Body Recomposition & Health</option>
                  </select>
                </div>

                <div className="auth-input-group">
                  <label>Activity Level</label>
                  <select value={activityLevel} onChange={(e) => setActivityLevel(e.target.value)}>
                    <option value="sedentary">Sedentary (Little or no exercise)</option>
                    <option value="light">Lightly Active (1-3 days/week)</option>
                    <option value="moderate">Moderately Active (3-5 days/week)</option>
                    <option value="veryActive">Very Active (6-7 intense days/week)</option>
                  </select>
                </div>

                <button type="submit" className="btn-primary auth-submit-btn" disabled={loading}>
                  {loading ? 'Creating Profile...' : 'Complete Registration'}
                </button>

                <p className="auth-switch-prompt">
                  Already have an account?{' '}
                  <button type="button" onClick={() => setIsSignup(false)} className="switch-text-btn">
                    Sign In
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