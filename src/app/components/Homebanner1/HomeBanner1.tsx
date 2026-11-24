'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { getBackendUrl } from '@/utils/backendUrl'
import {
  IoFlameOutline,
  IoWaterOutline,
  IoMoonOutline,
  IoFootstepsOutline,
  IoScaleOutline,
  IoFitnessOutline,
  IoArrowForward,
  IoSparklesOutline,
  IoTrendingUpOutline,
  IoCheckmarkCircle
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
      name: 'Active Workouts',
      slug: 'workout',
      value: 4,
      goal: 5,
      unit: 'days',
      icon: IoFitnessOutline,
      accentColor: '#3b82f6',
    },
  ])

  const backendUrl = getBackendUrl()

  const fetchLiveReport = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('driftlift_token') : null
      const headers: Record<string, string> = {}
      if (token) headers['Authorization'] = `Bearer ${token}`

      const res = await fetch(`${backendUrl}/report/getreport`, {
        method: 'GET',
        headers,
        credentials: 'include',
      })
      const data = await res.json()

      if (data.ok && Array.isArray(data.data)) {
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
              icon: iconMap[slug] || IoSparklesOutline,
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

  // Calculate overall day adherence
  const overallAdherence = Math.round(
    metrics.reduce((acc, item) => {
      const p = item.goal > 0 ? Math.min((item.value / item.goal) * 100, 100) : 0
      return acc + p
    }, 0) / metrics.length
  )

  return (
    <section className="dashboard-metrics-section">
      <div className="metrics-header-row">
        <div>
          <span className="badge-glow">DAILY BIOMETRICS</span>
          <h2 className="metrics-main-heading">Target Vitals & Energy Balance</h2>
          <p className="metrics-subtitle">
            Synchronized telemetry tracking caloric energy, hydration, sleep stages, and active physical volume.
          </p>
        </div>

        <div className="overall-adherence-card">
          <div className="adherence-label-row">
            <span className="adherence-label">Daily Adherence</span>
            <span className="adherence-val">{overallAdherence}%</span>
          </div>
          <div className="adherence-bar-track">
            <div className="adherence-bar-fill" style={{ width: `${overallAdherence}%` }} />
          </div>
        </div>
      </div>

      <div className="metrics-cards-grid">
        {metrics.map((item, idx) => {
          const Icon = item.icon
          const percent = item.goal > 0 ? Math.min(Math.round((item.value / item.goal) * 100), 100) : 0
          const isComplete = percent >= 100

          return (
            <div key={idx} className="metric-vitals-card">
              <div className="card-top-bar">
                <div className="metric-icon-box">
                  <Icon size={18} />
                </div>
                <span className={`metric-status-pill ${isComplete ? 'complete' : ''}`}>
                  {isComplete ? 'Goal Met' : `${percent}%`}
                </span>
              </div>

              <div className="card-metric-info">
                <span className="metric-name">{item.name}</span>
                <div className="metric-numeric-row">
                  <span className="numeric-current">
                    {item.value} <span className="numeric-unit">{item.unit}</span>
                  </span>
                  <span className="numeric-target">
                    Target: {item.goal} {item.unit}
                  </span>
                </div>

                {/* Refined Progress Bar */}
                <div className="vital-track">
                  <div
                    className="vital-fill"
                    style={{
                      width: `${percent}%`,
                      backgroundColor: item.accentColor,
                    }}
                  />
                </div>
              </div>

              <Link href={`/report/${item.slug}`} className="vital-link">
                <span>View Trend & Analytics</span>
                <IoArrowForward size={14} className="vital-link-arrow" />
              </Link>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default HomeBanner1
