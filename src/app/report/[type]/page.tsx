'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { LineChart } from '@mui/x-charts/LineChart'
import {
  IoChevronBack,
  IoAddCircleOutline,
  IoFlameOutline,
  IoWaterOutline,
  IoMoonOutline,
  IoFootstepsOutline,
  IoScaleOutline,
  IoFitnessOutline,
  IoTrendingUp,
  IoCheckmarkDoneCircleOutline,
  IoCameraOutline
} from 'react-icons/io5'
import QuickLogModal from '@/app/components/QuickLogModal/QuickLogModal'
import './Reportpage.css'

interface MetricConfig {
  name: string
  slug: string
  unit: string
  endpoint: string
  defaultGoal: number
  color: string
  icon: any
  valueKey: string
}

const METRIC_CONFIGS: Record<string, MetricConfig> = {
  calorie: {
    name: 'Calorie Intake',
    slug: 'calorie',
    unit: 'kcal',
    endpoint: '/calorieintake/getcalorieintakebylimit',
    defaultGoal: 2200,
    color: '#f59e0b',
    icon: IoFlameOutline,
    valueKey: 'calorieIntake',
  },
  water: {
    name: 'Hydration Tracking',
    slug: 'water',
    unit: 'ml',
    endpoint: '/watertrack/getwaterbylimit',
    defaultGoal: 3500,
    color: '#06b6d4',
    icon: IoWaterOutline,
    valueKey: 'amountInMilliliters',
  },
  sleep: {
    name: 'Sleep Quality',
    slug: 'sleep',
    unit: 'hrs',
    endpoint: '/sleeptrack/getsleepbylimit',
    defaultGoal: 8,
    color: '#8b5cf6',
    icon: IoMoonOutline,
    valueKey: 'durationInHrs',
  },
  steps: {
    name: 'Step Count',
    slug: 'steps',
    unit: 'steps',
    endpoint: '/steptrack/getstepsbylimit',
    defaultGoal: 10000,
    color: '#10b981',
    icon: IoFootstepsOutline,
    valueKey: 'steps',
  },
  weight: {
    name: 'Weight Progression',
    slug: 'weight',
    unit: 'kg',
    endpoint: '/weighttrack/getweightbylimit',
    defaultGoal: 70,
    color: '#f43f5e',
    icon: IoScaleOutline,
    valueKey: 'weight',
  },
  workout: {
    name: 'Workout Duration',
    slug: 'workout',
    unit: 'mins',
    endpoint: '/workouttrack/getworkoutsbylimit',
    defaultGoal: 45,
    color: '#3b82f6',
    icon: IoFitnessOutline,
    valueKey: 'durationInMinutes',
  },
}

const ReportPage = () => {
  const params = useParams()
  const router = useRouter()
  const rawSlug = params?.type ? (Array.isArray(params.type) ? params.type[0] : params.type) : 'calorie'
  
  // Clean slug
  const normalizedSlug = rawSlug.toLowerCase().replace(/%20/g, '').replace(/intake/g, '').trim()
  const currentMetricKey = METRIC_CONFIGS[normalizedSlug] ? normalizedSlug : 'calorie'
  const config = METRIC_CONFIGS[currentMetricKey]

  const [daysLimit, setDaysLimit] = useState<number>(10)
  const [chartData, setChartData] = useState<{ x: string[]; y: number[] }>({ x: [], y: [] })
  const [loading, setLoading] = useState<boolean>(true)
  const [showLogModal, setShowLogModal] = useState<boolean>(false)

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:8000'

  const fetchMetricData = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${backendUrl}${config.endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ limit: daysLimit }),
      })
      const data = await res.json()

      if (data.ok && Array.isArray(data.data) && data.data.length > 0) {
        // Group & sort entries
        const dates: string[] = []
        const values: number[] = []

        data.data.forEach((entry: any) => {
          if (entry.date) {
            const formatted = new Date(entry.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })
            dates.push(formatted)
            values.push(Number(entry[config.valueKey]) || 0)
          }
        })

        setChartData({ x: dates, y: values })
      } else {
        setChartData({ x: [], y: [] })
      }
    } catch {
      setChartData({ x: [], y: [] })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMetricData()
  }, [currentMetricKey, daysLimit])

  // Computed KPIs based strictly on real logged data
  const total = chartData.y.reduce((acc, val) => acc + val, 0)
  const avg = chartData.y.length > 0 ? Math.round(total / chartData.y.length) : 0
  const peak = chartData.y.length > 0 ? Math.max(...chartData.y) : 0
  const latest = chartData.y.length > 0 ? chartData.y[chartData.y.length - 1] : 0

  const Icon = config.icon

  return (
    <div className="report-page-wrapper">
      {/* Top Breadcrumb & Switcher */}
      <div className="report-top-bar">
        <Link href="/" className="back-link">
          <IoChevronBack size={18} /> Dashboard
        </Link>
        <div className="metric-pill-list">
          {Object.entries(METRIC_CONFIGS).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => router.push(`/report/${key}`)}
              className={`metric-pill ${currentMetricKey === key ? 'active' : ''}`}
            >
              {cfg.name}
            </button>
          ))}
        </div>
      </div>

      {/* Hero Header */}
      <div className="report-hero-card glass-panel">
        <div className="report-hero-left">
          <div
            className="metric-big-icon"
            style={{
              backgroundColor: `${config.color}20`,
              color: config.color,
              borderColor: `${config.color}40`,
            }}
          >
            <Icon size={32} />
          </div>
          <div>
            <div className="report-badge-row">
              <span className="badge-glow">Performance Analytics</span>
            </div>
            <h1>{config.name}</h1>
            <p>Historical trends, daily averages, and progress variance over time</p>
          </div>
        </div>

        <div className="report-hero-actions">
          <div className="time-range-group">
            {[7, 14, 30].map((d) => (
              <button
                key={d}
                className={`time-btn ${daysLimit === d ? 'active' : ''}`}
                onClick={() => setDaysLimit(d)}
              >
                {d}D
              </button>
            ))}
          </div>
          {currentMetricKey === 'calorie' && (
            <Link
              href="/food-scanner"
              className="btn-secondary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                borderColor: 'rgba(16, 185, 129, 0.4)',
                color: '#34d399',
                background: 'rgba(16, 185, 129, 0.1)',
                textDecoration: 'none',
              }}
            >
              <IoCameraOutline size={18} />
              <span>AI Food Scanner</span>
            </Link>
          )}
          <button className="btn-primary log-new-btn" onClick={() => setShowLogModal(true)}>
            <IoAddCircleOutline size={20} /> Log Entry
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="report-kpi-grid">
        <div className="kpi-card glass-card">
          <span className="kpi-label">Latest Recorded</span>
          <div className="kpi-val" style={{ color: config.color }}>
            {latest} <span className="kpi-unit">{config.unit}</span>
          </div>
          <span className="kpi-sub">Most recent logged day</span>
        </div>

        <div className="kpi-card glass-card">
          <span className="kpi-label">Average ({daysLimit} Days)</span>
          <div className="kpi-val">
            {avg} <span className="kpi-unit">{config.unit}</span>
          </div>
          <span className="kpi-sub">Daily average over period</span>
        </div>

        <div className="kpi-card glass-card">
          <span className="kpi-label">Peak Performance</span>
          <div className="kpi-val">
            {peak} <span className="kpi-unit">{config.unit}</span>
          </div>
          <span className="kpi-sub">Highest daily output</span>
        </div>

        <div className="kpi-card glass-card">
          <span className="kpi-label">Target Baseline</span>
          <div className="kpi-val">
            {config.defaultGoal} <span className="kpi-unit">{config.unit}</span>
          </div>
          <span className="kpi-sub">
            <IoCheckmarkDoneCircleOutline /> Configured Daily Goal
          </span>
        </div>
      </div>

      {/* Chart Section */}
      <div className="report-chart-container glass-panel">
        <div className="chart-header">
          <div className="chart-title-wrap">
            <IoTrendingUp size={22} style={{ color: config.color }} />
            <h3>Trend Progression (Last {daysLimit} Days)</h3>
          </div>
          <span className="chart-legend-chip" style={{ color: config.color, borderColor: `${config.color}40` }}>
            ● {config.name} ({config.unit})
          </span>
        </div>

        <div className="chart-canvas-wrap">
          {chartData.x.length > 0 ? (
            <LineChart
              xAxis={[
                {
                  scaleType: 'point',
                  data: chartData.x,
                  tickLabelStyle: { fill: '#94a3b8', fontSize: 12 },
                },
              ]}
              yAxis={[
                {
                  tickLabelStyle: { fill: '#94a3b8', fontSize: 12 },
                },
              ]}
              series={[
                {
                  data: chartData.y,
                  color: config.color,
                  curve: 'natural',
                  area: true,
                  showMark: true,
                },
              ]}
              height={360}
              margin={{ left: 50, right: 20, top: 20, bottom: 40 }}
            />
          ) : (
            <div
              className="no-data-notice"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '300px',
                gap: '14px',
                color: '#94a3b8',
                textAlign: 'center',
                padding: '40px 20px',
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: `${config.color}15`,
                  color: config.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.75rem',
                  border: `1px solid ${config.color}35`,
                }}
              >
                <Icon size={28} />
              </div>
              <div style={{ maxWidth: '420px' }}>
                <h4 style={{ color: '#f8fafc', fontSize: '1.1rem', marginBottom: '6px', fontWeight: 600 }}>
                  No {config.name} Recorded Yet
                </h4>
                <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5 }}>
                  You haven&apos;t logged any {config.name.toLowerCase()} entries in the selected {daysLimit}-day timeframe.
                  Log your first entry to start generating analytics.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowLogModal(true)}
                className="btn-primary"
                style={{
                  marginTop: '6px',
                  background: `linear-gradient(135deg, ${config.color} 0%, #059669 100%)`,
                  boxShadow: `0 4px 16px ${config.color}30`,
                }}
              >
                <IoAddCircleOutline size={18} />
                <span>Log {config.name}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <QuickLogModal
        isOpen={showLogModal}
        onClose={() => setShowLogModal(false)}
        onSuccess={fetchMetricData}
      />
    </div>
  )
}

export default ReportPage
