'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  IoFlameOutline,
  IoWaterOutline,
  IoMoonOutline,
  IoFootstepsOutline,
  IoScaleOutline,
  IoFitnessOutline,
  IoArrowForward,
  IoSparkles
} from 'react-icons/io5'
import './HomeBanner1.css'

interface MetricItem {
  name: string
  slug: string
  value: number
  goal: number
  unit: string
  icon: any
  accentColor: string
}

const HomeBanner1 = () => {
  const [metrics, setMetrics] = useState<MetricItem[]>([
    {
      name: 'Calorie Intake',
      slug: 'calorie',
      value: 1850,
      goal: 2200,
      unit: 'kcal',
      icon: IoFlameOutline,
      accentColor: '#f59e0b',
    },
    {
      name: 'Sleep Quality',
      slug: 'sleep',
      value: 7.5,
      goal: 8,
      unit: 'hrs',
      icon: IoMoonOutline,
      accentColor: '#8b5cf6',
    },
    {
      name: 'Daily Steps',
      slug: 'steps',
      value: 8400,
      goal: 10000,
      unit: 'steps',
      icon: IoFootstepsOutline,
      accentColor: '#10b981',
    },
    {
      name: 'Hydration',
      slug: 'water',
      value: 2750,
      goal: 3500,
      unit: 'ml',
      icon: IoWaterOutline,
      accentColor: '#06b6d4',
    },
    {
      name: 'Body Weight',
      slug: 'weight',
      value: 74.2,
      goal: 70.0,
      unit: 'kg',
      icon: IoScaleOutline,
      accentColor: '#f43f5e',
    },
    {
      name: 'Workouts Active',
      slug: 'workout',
      value: 4,
      goal: 5,
      unit: 'days',
      icon: IoFitnessOutline,
      accentColor: '#3b82f6',
    },
  ])

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:8000'

  const fetchLiveReport = async () => {
    try {
      const res = await fetch(`${backendUrl}/report/getreport`, {
        method: 'GET',
        credentials: 'include',
      })
      const data = await res.json()

      if (data.ok && Array.isArray(data.data)) {
        // Map backend response to our cards
        const slugMap: Record<string, string> = {
          'calorie intake': 'calorie',
          'sleep': 'sleep',
          'steps': 'steps',
          'water': 'water',
          'workout': 'workout',
          'weight': 'weight',
        }

        const iconMap: Record<string, any> = {
          calorie: IoFlameOutline,
          sleep: IoMoonOutline,
          steps: IoFootstepsOutline,
          water: IoWaterOutline,
          weight: IoScaleOutline,
          workout: IoFitnessOutline,
        }

        const colorMap: Record<string, string> = {
          calorie: '#f59e0b',
          sleep: '#8b5cf6',
          steps: '#10b981',
          water: '#06b6d4',
          weight: '#f43f5e',
          workout: '#3b82f6',
        }

        const mapped: MetricItem[] = data.data
          .filter((item: any) => item.name.toLowerCase() !== 'height')
          .map((item: any) => {
            const rawName = item.name.toLowerCase().trim()
            const slug = slugMap[rawName] || rawName
            return {
              name: item.name,
              slug,
              value: Number(item.value) || 0,
              goal: Number(item.goal) || 100,
              unit: item.unit || '',
              icon: iconMap[slug] || IoSparkles,
              accentColor: colorMap[slug] || '#10b981',
            }
          })

        if (mapped.length > 0) {
          setMetrics(mapped)
        }
      }
    } catch (err) {
      // Graceful fallback to default initial state
    }
  }

  useEffect(() => {
    fetchLiveReport()
  }, [])

  return (
    <section className="dashboard-metrics-section">
      <div className="section-title-row">
        <div>
          <span className="badge-glow">Real-Time Vitals</span>
          <h2 className="section-main-heading">Today's Target Metrics</h2>
        </div>
        <p className="section-subtitle">
          Synchronized tracking across hydration, caloric energy, sleep cycles, and daily output.
        </p>
      </div>

      <div className="metrics-cards-grid">
        {metrics.map((item, idx) => {
          const Icon = item.icon
          const percent = item.goal > 0 ? Math.min(Math.round((item.value / item.goal) * 100), 100) : 0

          return (
            <div key={idx} className="metric-glass-card glass-card">
              <div className="card-top">
                <div
                  className="card-icon-box"
                  style={{
                    backgroundColor: `${item.accentColor}18`,
                    color: item.accentColor,
                    borderColor: `${item.accentColor}35`,
                  }}
                >
                  <Icon size={24} />
                </div>
                <div className="progress-badge" style={{ color: item.accentColor }}>
                  {percent}%
                </div>
              </div>

              <div className="card-body">
                <span className="metric-label">{item.name}</span>
                <div className="metric-values-row">
                  <span className="current-val">
                    {item.value} <span className="val-unit">{item.unit}</span>
                  </span>
                  <span className="goal-val">
                    Goal: {item.goal} {item.unit}
                  </span>
                </div>

                {/* Progress Track */}
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${percent}%`,
                      backgroundColor: item.accentColor,
                      boxShadow: `0 0 10px ${item.accentColor}60`,
                    }}
                  ></div>
                </div>
              </div>

              <Link href={`/report/${item.slug}`} className="view-analytics-btn">
                <span>View Trend & Analytics</span>
                <IoArrowForward size={16} />
              </Link>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default HomeBanner1