'use client'

import React, { useState } from 'react'
import { IoClose, IoWaterOutline, IoFlameOutline, IoMoonOutline, IoFootstepsOutline, IoFitnessOutline, IoScaleOutline } from 'react-icons/io5'
import { toast } from 'react-toastify'
import './QuickLogModal.css'

interface QuickLogModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

type TabType = 'calorie' | 'water' | 'sleep' | 'steps' | 'weight' | 'workout'

const QuickLogModal: React.FC<QuickLogModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState<TabType>('water')
  const [loading, setLoading] = useState(false)

  // Calorie form
  const [mealItem, setMealItem] = useState('')
  const [calorieAmount, setCalorieAmount] = useState('')
  const [quantity, setQuantity] = useState('1')

  // Water form
  const [waterMl, setWaterMl] = useState('250')

  // Sleep form
  const [sleepHours, setSleepHours] = useState('8')

  // Steps form
  const [stepCount, setStepCount] = useState('5000')

  // Weight form
  const [weightVal, setWeightVal] = useState('70')

  // Workout form
  const [workoutName, setWorkoutName] = useState('')
  const [workoutDuration, setWorkoutDuration] = useState('45')

  if (!isOpen) return null

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:8000'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let endpoint = ''
      let payload: any = { date: new Date().toISOString() }

      if (activeTab === 'water') {
        endpoint = '/watertrack/addwaterentry'
        payload.amountInMilliliters = Number(waterMl)
      } else if (activeTab === 'calorie') {
        endpoint = '/calorieintake/addcalorieintake'
        payload.item = mealItem || 'Meal'
        payload.quantity = Number(quantity) || 1
        payload.quantitytype = 'serving'
        payload.calorieIntake = Number(calorieAmount)
      } else if (activeTab === 'sleep') {
        endpoint = '/sleeptrack/addsleepentry'
        payload.durationInHrs = Number(sleepHours)
      } else if (activeTab === 'steps') {
        endpoint = '/steptrack/addstepentry'
        payload.steps = Number(stepCount)
      } else if (activeTab === 'weight') {
        endpoint = '/weighttrack/addweightentry'
        payload.weightInKg = Number(weightVal)
      } else if (activeTab === 'workout') {
        endpoint = '/workouttrack/addworkoutentry'
        payload.exercise = workoutName || 'General Workout'
        payload.durationInMinutes = Number(workoutDuration)
      }

      const res = await fetch(`${backendUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (data.ok) {
        toast.success(data.message || 'Logged successfully!')
        if (onSuccess) onSuccess()
        onClose()
      } else {
        toast.error(data.message || 'Please log in to track metrics')
      }
    } catch (err: any) {
      toast.error('Network error connecting to backend server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="quicklog-overlay" onClick={onClose}>
      <div className="quicklog-modal glass-panel" onClick={(e) => e.stopPropagation()}>
        <div className="quicklog-header">
          <div>
            <h2>Quick Track</h2>
            <p>Log your daily fitness & wellness stats</p>
          </div>
          <button className="quicklog-close-btn" onClick={onClose}>
            <IoClose size={22} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="quicklog-tabs">
          <button
            type="button"
            className={`quicklog-tab ${activeTab === 'water' ? 'active' : ''}`}
            onClick={() => setActiveTab('water')}
          >
            <IoWaterOutline /> Water
          </button>
          <button
            type="button"
            className={`quicklog-tab ${activeTab === 'calorie' ? 'active' : ''}`}
            onClick={() => setActiveTab('calorie')}
          >
            <IoFlameOutline /> Calories
          </button>
          <button
            type="button"
            className={`quicklog-tab ${activeTab === 'workout' ? 'active' : ''}`}
            onClick={() => setActiveTab('workout')}
          >
            <IoFitnessOutline /> Workout
          </button>
          <button
            type="button"
            className={`quicklog-tab ${activeTab === 'sleep' ? 'active' : ''}`}
            onClick={() => setActiveTab('sleep')}
          >
            <IoMoonOutline /> Sleep
          </button>
          <button
            type="button"
            className={`quicklog-tab ${activeTab === 'steps' ? 'active' : ''}`}
            onClick={() => setActiveTab('steps')}
          >
            <IoFootstepsOutline /> Steps
          </button>
          <button
            type="button"
            className={`quicklog-tab ${activeTab === 'weight' ? 'active' : ''}`}
            onClick={() => setActiveTab('weight')}
          >
            <IoScaleOutline /> Weight
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="quicklog-form">
          {activeTab === 'water' && (
            <div className="tab-pane">
              <label>Amount (ml)</label>
              <div className="quick-presets">
                {['250', '500', '750', '1000'].map((val) => (
                  <button
                    key={val}
                    type="button"
                    className={`preset-btn ${waterMl === val ? 'active' : ''}`}
                    onClick={() => setWaterMl(val)}
                  >
                    +{val} ml
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={waterMl}
                onChange={(e) => setWaterMl(e.target.value)}
                placeholder="Custom amount in ml"
                required
              />
            </div>
          )}

          {activeTab === 'calorie' && (
            <div className="tab-pane">
              <label>Meal / Food Item</label>
              <input
                type="text"
                value={mealItem}
                onChange={(e) => setMealItem(e.target.value)}
                placeholder="e.g. Oatmeal & Banana / Grilled Chicken"
                required
              />

              <div className="two-cols">
                <div>
                  <label>Calories (kcal)</label>
                  <input
                    type="number"
                    value={calorieAmount}
                    onChange={(e) => setCalorieAmount(e.target.value)}
                    placeholder="e.g. 450"
                    required
                  />
                </div>
                <div>
                  <label>Portion (Servings)</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="1"
                    min="1"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'workout' && (
            <div className="tab-pane">
              <label>Exercise Routine</label>
              <input
                type="text"
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
                placeholder="e.g. Chest Hypertrophy, 5km Run, Core Blast"
                required
              />
              <label>Duration (Minutes)</label>
              <input
                type="number"
                value={workoutDuration}
                onChange={(e) => setWorkoutDuration(e.target.value)}
                placeholder="e.g. 45"
                required
              />
            </div>
          )}

          {activeTab === 'sleep' && (
            <div className="tab-pane">
              <label>Sleep Duration (Hours)</label>
              <div className="quick-presets">
                {['6', '7', '8', '9'].map((val) => (
                  <button
                    key={val}
                    type="button"
                    className={`preset-btn ${sleepHours === val ? 'active' : ''}`}
                    onClick={() => setSleepHours(val)}
                  >
                    {val} Hours
                  </button>
                ))}
              </div>
              <input
                type="number"
                step="0.5"
                value={sleepHours}
                onChange={(e) => setSleepHours(e.target.value)}
                placeholder="e.g. 7.5"
                required
              />
            </div>
          )}

          {activeTab === 'steps' && (
            <div className="tab-pane">
              <label>Steps Today</label>
              <div className="quick-presets">
                {['3000', '6000', '10000', '12000'].map((val) => (
                  <button
                    key={val}
                    type="button"
                    className={`preset-btn ${stepCount === val ? 'active' : ''}`}
                    onClick={() => setStepCount(val)}
                  >
                    {val} steps
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={stepCount}
                onChange={(e) => setStepCount(e.target.value)}
                placeholder="e.g. 8450"
                required
              />
            </div>
          )}

          {activeTab === 'weight' && (
            <div className="tab-pane">
              <label>Current Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                value={weightVal}
                onChange={(e) => setWeightVal(e.target.value)}
                placeholder="e.g. 74.5"
                required
              />
            </div>
          )}

          <div className="quicklog-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default QuickLogModal
