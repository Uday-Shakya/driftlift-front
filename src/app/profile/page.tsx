'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  IoPersonCircleOutline,
  IoCalculatorOutline,
  IoFlameOutline,
  IoWaterOutline,
  IoScaleOutline,
  IoFitnessOutline,
  IoSaveOutline,
  IoChevronBack,
  IoCheckmarkCircle
} from 'react-icons/io5'
import { toast } from 'react-toastify'
import './profile.css'

const ProfilePage = () => {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(true)

  // Profile editable fields
  const [name, setName] = useState('')
  const [gender, setGender] = useState('male')
  const [goal, setGoal] = useState('weightLoss')
  const [activityLevel, setActivityLevel] = useState('moderate')
  const [weightKg, setWeightKg] = useState('75')
  const [heightCm, setHeightCm] = useState('175')
  const [age, setAge] = useState('24')

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:8000'

  const fetchProfile = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${backendUrl}/auth/getuser`, {
        method: 'GET',
        credentials: 'include',
      })
      const data = await res.json()
      if (data.ok && data.data) {
        const u = data.data
        setUser(u)
        setName(u.name || '')
        setGender(u.gender || 'male')
        setGoal(u.goal || 'weightLoss')
        setActivityLevel(u.activityLevel || 'moderate')

        if (u.weight && u.weight.length > 0) {
          setWeightKg(String(u.weight[u.weight.length - 1].weight))
        }
        if (u.height && u.height.length > 0) {
          setHeightCm(String(u.height[u.height.length - 1].height))
        }
        if (u.dob) {
          const birthYear = new Date(u.dob).getFullYear()
          if (!isNaN(birthYear)) {
            setAge(String(new Date().getFullYear() - birthYear))
          }
        }
      }
    } catch (err) {
      // Offline/Guest calculator mode
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  // Calculations: BMR, TDEE, BMI
  const w = parseFloat(weightKg) || 70
  const h = parseFloat(heightCm) || 175
  const a = parseFloat(age) || 25

  // Mifflin - St Jeor Equation
  let bmr = (10 * w) + (6.25 * h) - (5 * a)
  bmr = gender === 'female' ? bmr - 161 : bmr + 5

  const activityMultipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    very_active: 1.725
  }
  const multiplier = activityMultipliers[activityLevel] || 1.4
  const tdee = Math.round(bmr * multiplier)

  const cutCalories = tdee - 500
  const bulkCalories = tdee + 400
  const recommendedWater = Math.round(w * 35) // ~35ml per kg

  // BMI
  const heightM = h / 100
  const bmi = heightM > 0 ? (w / (heightM * heightM)).toFixed(1) : '22.0'

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch(`${backendUrl}/auth/updateuser`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name,
          goal,
          activityLevel,
          gender,
        })
      })
      const data = await res.json()
      if (data.ok) {
        toast.success('Fitness Profile & Goals Updated Successfully! 🎉')
      } else {
        toast.error(data.message || 'Error updating profile')
      }
    } catch (err) {
      toast.error('Network error saving profile')
    }
  }

  return (
    <div className="profile-page-wrapper">
      <div className="profile-header-bar">
        <Link href="/" className="back-link">
          <IoChevronBack size={18} /> Back to Dashboard
        </Link>
        <span className="badge-glow">Biometric Intelligence</span>
      </div>

      <div className="profile-grid">
        {/* Left Column: Personal Info & Goals */}
        <div className="profile-card glass-panel">
          <div className="user-avatar-badge">
            <IoPersonCircleOutline size={64} className="avatar-icon" />
            <div>
              <h2>{name || 'Fitness Enthusiast'}</h2>
              <p className="user-email-text">{user?.email || 'Logged as Guest'}</p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="profile-form">
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
              />
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label>Gender</label>
                <select value={gender} onChange={(e) => setGender(e.target.value)}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div className="form-group">
                <label>Age</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="25"
                  min="12"
                  max="100"
                />
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label>Height (cm)</label>
                <input
                  type="number"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  placeholder="175"
                />
              </div>
              <div className="form-group">
                <label>Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  placeholder="70"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Primary Fitness Goal</label>
              <select value={goal} onChange={(e) => setGoal(e.target.value)}>
                <option value="weightLoss">Fat Loss & Definition (Deficit)</option>
                <option value="weightGain">Muscle Hypertrophy & Bulking (Surplus)</option>
                <option value="maintain">Body Recomposition & Maintenance</option>
              </select>
            </div>

            <div className="form-group">
              <label>Activity Level</label>
              <select value={activityLevel} onChange={(e) => setActivityLevel(e.target.value)}>
                <option value="sedentary">Sedentary (Desk job, little exercise)</option>
                <option value="light">Lightly Active (1-3 workout days/wk)</option>
                <option value="moderate">Moderately Active (3-5 workout days/wk)</option>
                <option value="very_active">Very Active (6-7 intense workout days/wk)</option>
              </select>
            </div>

            <button type="submit" className="btn-primary save-profile-btn">
              <IoSaveOutline size={18} /> Update Fitness Targets
            </button>
          </form>
        </div>

        {/* Right Column: Calculated Metabolic Engine & Nutrition Targets */}
        <div className="calculator-card glass-panel">
          <div className="calc-header">
            <IoCalculatorOutline size={28} className="calc-icon" />
            <div>
              <h3>Smart Metabolic Targets</h3>
              <p>Scientifically derived nutrition & hydration baseline</p>
            </div>
          </div>

          <div className="metabolic-stats-grid">
            <div className="metric-box glass-card">
              <div className="metric-icon-wrap amber">
                <IoFlameOutline size={22} />
              </div>
              <span className="metric-title">Basal Metabolic Rate</span>
              <span className="metric-big-val">{Math.round(bmr)}</span>
              <span className="metric-unit">kcal / day (rest)</span>
            </div>

            <div className="metric-box glass-card">
              <div className="metric-icon-wrap emerald">
                <IoFitnessOutline size={22} />
              </div>
              <span className="metric-title">Maintenance (TDEE)</span>
              <span className="metric-big-val">{tdee}</span>
              <span className="metric-unit">kcal / day (active)</span>
            </div>

            <div className="metric-box glass-card">
              <div className="metric-icon-wrap cyan">
                <IoWaterOutline size={22} />
              </div>
              <span className="metric-title">Daily Hydration Target</span>
              <span className="metric-big-val">{(recommendedWater / 1000).toFixed(1)}</span>
              <span className="metric-unit">Liters / day</span>
            </div>

            <div className="metric-box glass-card">
              <div className="metric-icon-wrap violet">
                <IoScaleOutline size={22} />
              </div>
              <span className="metric-title">Body Mass Index (BMI)</span>
              <span className="metric-big-val">{bmi}</span>
              <span className="metric-unit">
                {parseFloat(bmi) < 18.5 ? 'Underweight' : parseFloat(bmi) < 25 ? 'Normal / Healthy' : 'Overweight'}
              </span>
            </div>
          </div>

          <div className="calorie-goal-breakdown glass-card">
            <h4>Target Recommendation based on "{goal}":</h4>
            <div className="target-pill-display">
              <span className="target-highlight-text">
                {goal === 'weightLoss' ? `${cutCalories} kcal/day` : goal === 'weightGain' ? `${bulkCalories} kcal/day` : `${tdee} kcal/day`}
              </span>
              <span className="target-subtext">
                {goal === 'weightLoss'
                  ? 'Calculated for safe, sustainable 0.5kg/week fat reduction'
                  : goal === 'weightGain'
                  ? 'Optimal lean mass surplus minimizing unnecessary fat gain'
                  : 'Perfect energy balance to sustain peak performance'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
