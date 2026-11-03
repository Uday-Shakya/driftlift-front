"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import styles from './page.module.css'
import HomeBanner1 from '@/app/components/Homebanner1/HomeBanner1'
import HomeBanner2 from '@/app/components/HomeBanner2/HomeBanner2'
import Footer from './components/Footer/Footer'
import {
  IoCameraOutline,
  IoSparklesOutline,
  IoPlayCircleOutline,
  IoCalculatorOutline,
  IoArrowForward,
  IoShieldCheckmarkOutline,
  IoFlameOutline,
  IoSpeedometerOutline,
  IoLayersOutline
} from 'react-icons/io5'

type ModuleType = 'vision' | 'heatmap' | 'tutorials' | 'biometrics'

interface TelemetryConfig {
  badge: string
  title: string
  summary: string
  icon: any
  iconColor: string
  iconBg: string
  borderColor: string
  linkHref: string
  linkText: string
  cells: Array<{ label: string; value: string; sub: string }>
}

const TELEMETRY_MODULES: Record<ModuleType, TelemetryConfig> = {
  vision: {
    badge: 'OPTICAL POSE ESTIMATION',
    title: 'AI Vision Coach',
    summary: 'Direct skeletal joint tracking via camera with real-time audio cadence.',
    icon: IoCameraOutline,
    iconColor: '#10b981',
    iconBg: 'rgba(16, 185, 129, 0.12)',
    borderColor: 'rgba(16, 185, 129, 0.35)',
    linkHref: '/vision-coach',
    linkText: 'Launch Optical Engine',
    cells: [
      { label: 'Joint Flexion', value: '94°', sub: 'Depth standard met' },
      { label: 'Set Cadence', value: '2.1s', sub: 'Eccentric control steady' },
      { label: 'Completed Reps', value: '12 / 15', sub: 'Set in progress' },
      { label: 'Optical Feed', value: '60 FPS', sub: 'Zero latency stream' },
    ],
  },
  heatmap: {
    badge: '3D KINETIC TOPOGRAPHY',
    title: 'Muscle Fatigue Heatmap',
    summary: 'Dynamic recovery mapping and volume load across all 14 major splits.',
    icon: IoSparklesOutline,
    iconColor: '#06b6d4',
    iconBg: 'rgba(6, 182, 212, 0.12)',
    borderColor: 'rgba(6, 182, 212, 0.35)',
    linkHref: '/heatmap',
    linkText: 'Inspect 3D Heatmap',
    cells: [
      { label: 'Pectoralis Major', value: '82%', sub: 'Prime / Ready to load' },
      { label: 'Anterior Deltoids', value: '58%', sub: 'Active recovery state' },
      { label: 'Latissimus Dorsi', value: '91%', sub: 'Full recovery threshold' },
      { label: 'Core / Abs', value: '45%', sub: 'Moderate exertion load' },
    ],
  },
  tutorials: {
    badge: 'HD BIOMECHANICAL STANDARDS',
    title: 'Curated Form Guides',
    summary: 'Professional kinematic walkthroughs prioritizing joint longevity over ego.',
    icon: IoPlayCircleOutline,
    iconColor: '#f59e0b',
    iconBg: 'rgba(245, 158, 11, 0.12)',
    borderColor: 'rgba(245, 158, 11, 0.35)',
    linkHref: '/workout/chest',
    linkText: 'Browse Form Repository',
    cells: [
      { label: 'Current Module', value: 'Chest Press', sub: '45° Scapular Plane' },
      { label: 'Tempo Ratio', value: '3-0-1-0', sub: 'Eccentric emphasis' },
      { label: 'Available Splits', value: '6 Groups', sub: 'Chest, Back, Arms, Legs' },
      { label: 'Video Quality', value: '1080p HD', sub: 'Multi-angle cues' },
    ],
  },
  biometrics: {
    badge: 'METABOLIC EXPENDITURE ENGINE',
    title: 'Biometric Analytics',
    summary: 'Mifflin-St Jeor TDEE and BMR equations with daily nutritional telemetry.',
    icon: IoCalculatorOutline,
    iconColor: '#a855f7',
    iconBg: 'rgba(168, 85, 247, 0.12)',
    borderColor: 'rgba(168, 85, 247, 0.35)',
    linkHref: '/profile',
    linkText: 'Calculate Personal BMR',
    cells: [
      { label: 'Calculated BMR', value: '1,840 kcal', sub: 'Basal metabolic baseline' },
      { label: 'Target TDEE', value: '2,550 kcal', sub: 'Hypertrophy target' },
      { label: 'Hydration Intake', value: '3,200 ml', sub: 'Daily optimal quota' },
      { label: 'Database Sync', value: 'Encrypted', sub: 'Per-user biometric log' },
    ],
  },
}

const Home = () => {
  const [activeTab, setActiveTab] = useState<ModuleType>('vision')
  const currentModule = TELEMETRY_MODULES[activeTab]
  const IconComponent = currentModule.icon

  return (
    <main className={styles.main}>
      {/* ── Architectural Hero Section ── */}
      <section className={styles.heroSection}>
        <div className={styles.ambientGlowLeft} />
        <div className={styles.ambientGlowRight} />

        <div className={styles.heroGrid}>
          {/* Left Column: Lead Architectural Headline & Actions */}
          <div className={styles.leadColumn}>
            <div className={styles.systemTag}>
              <span className={styles.pulseDot} />
              <span>DRIFTLIFT PLATFORM</span>
              <span className={styles.systemVersion}>// v2.4 PRO</span>
            </div>

            <h1 className={styles.heroTitle}>
              Engineered for precision.
              <span className={styles.heroTitleEm}>Trained by computer vision.</span>
            </h1>

            <p className={styles.heroSubtitle}>
              Real-time skeletal joint analysis, interactive 3D recovery heatmaps, and
              biomechanical volume tracking. Built for athletes who measure progress with data,
              not guesswork.
            </p>

            <div className={styles.ctaRow}>
              <Link href="/vision-coach" className={styles.primaryCta}>
                <IoCameraOutline size={20} />
                <span>Launch Vision Engine</span>
                <IoArrowForward size={16} />
              </Link>

              <Link href="/heatmap" className={styles.secondaryCta}>
                <IoSparklesOutline size={18} />
                <span>3D Heatmap</span>
              </Link>
            </div>

            {/* Platform Telemetry Specs Strip */}
            <div className={styles.specsStrip}>
              <div className={styles.specItem}>
                <span className={styles.specValue}>33 Points</span>
                <span className={styles.specLabel}>Skeletal Detection</span>
              </div>
              <div className={styles.specDivider} />
              <div className={styles.specItem}>
                <span className={styles.specValue}>60 FPS</span>
                <span className={styles.specLabel}>Optical Cadence</span>
              </div>
              <div className={styles.specDivider} />
              <div className={styles.specItem}>
                <span className={styles.specValue}>14 Regions</span>
                <span className={styles.specLabel}>Recovery Topography</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Biometrics Telemetry Deck */}
          <div className={styles.consoleWrapper}>
            <div className={styles.consoleCard}>
              {/* Telemetry Status Bar */}
              <div className={styles.consoleHeader}>
                <div className={styles.consoleStatus}>
                  <span className={styles.liveBadgeDot} />
                  <span>KINETIC TELEMETRY CONSOLE</span>
                </div>
                <span className={styles.consoleId}>SYS.FEED // LIVE</span>
              </div>

              {/* Module Switcher Tabs */}
              <div className={styles.moduleTabs}>
                {(['vision', 'heatmap', 'tutorials', 'biometrics'] as ModuleType[]).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`${styles.moduleTabBtn} ${activeTab === tab ? styles.moduleTabActive : ''}`}
                  >
                    {tab === 'vision' && '01. Vision'}
                    {tab === 'heatmap' && '02. Heatmap'}
                    {tab === 'tutorials' && '03. Guides'}
                    {tab === 'biometrics' && '04. Metrics'}
                  </button>
                ))}
              </div>

              {/* Telemetry Body */}
              <div className={styles.telemetryBody}>
                <div className={styles.moduleHeaderRow}>
                  <div className={styles.moduleMeta}>
                    <span className={styles.moduleBadge}>{currentModule.badge}</span>
                    <h2 className={styles.moduleTitle}>{currentModule.title}</h2>
                    <p className={styles.moduleSummary}>{currentModule.summary}</p>
                  </div>
                  <div
                    className={styles.moduleIconPill}
                    style={{
                      color: currentModule.iconColor,
                      background: currentModule.iconBg,
                      borderColor: currentModule.borderColor,
                    }}
                  >
                    <IconComponent />
                  </div>
                </div>

                {/* 4 Telemetry Metric Cells */}
                <div className={styles.telemetryGrid}>
                  {currentModule.cells.map((cell) => (
                    <div key={cell.label} className={styles.telemetryCell}>
                      <span className={styles.telemetryLabel}>{cell.label}</span>
                      <span className={styles.telemetryVal}>{cell.value}</span>
                      <span className={styles.telemetrySub}>{cell.sub}</span>
                    </div>
                  ))}
                </div>

                {/* Console Action Link */}
                <div className={styles.consoleFooter}>
                  <Link href={currentModule.linkHref} className={styles.consoleLaunchLink}>
                    <span>{currentModule.linkText}</span>
                    <IoArrowForward size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Performance Architecture Pipeline (Bottom 4-Card Index) ── */}
        <div className={styles.pipelineSection}>
          <div className={styles.pipelineHeader}>
            <span className={styles.pipelineTitle}>SYSTEM CAPABILITIES ARCHITECTURE</span>
            <span className={styles.pipelineStatus}>04 MODULES DEPLOYED</span>
          </div>

          <div className={styles.pipelineGrid}>
            <Link href="/vision-coach" className={styles.pipelineCard}>
              <div className={styles.cardTopRow}>
                <span className={styles.cardIndex}>01 // OPTICAL</span>
                <span className={styles.cardIconBox} style={{ color: '#10b981' }}>
                  <IoCameraOutline />
                </span>
              </div>
              <div className={styles.cardContent}>
                <div className={styles.cardTitle}>
                  <span>AI Vision Coach</span>
                  <IoArrowForward className={styles.cardArrow} />
                </div>
                <p className={styles.cardDesc}>
                  Live joint angle inference and cadence cues without wearables.
                </p>
              </div>
            </Link>

            <Link href="/heatmap" className={styles.pipelineCard}>
              <div className={styles.cardTopRow}>
                <span className={styles.cardIndex}>02 // TOPOGRAPHY</span>
                <span className={styles.cardIconBox} style={{ color: '#06b6d4' }}>
                  <IoSparklesOutline />
                </span>
              </div>
              <div className={styles.cardContent}>
                <div className={styles.cardTitle}>
                  <span>3D Muscle Heatmap</span>
                  <IoArrowForward className={styles.cardArrow} />
                </div>
                <p className={styles.cardDesc}>
                  Interactive DOMS recovery mapping across 14 muscle groups.
                </p>
              </div>
            </Link>

            <Link href="/workout/chest" className={styles.pipelineCard}>
              <div className={styles.cardTopRow}>
                <span className={styles.cardIndex}>03 // BIOMECHANICS</span>
                <span className={styles.cardIconBox} style={{ color: '#f59e0b' }}>
                  <IoPlayCircleOutline />
                </span>
              </div>
              <div className={styles.cardContent}>
                <div className={styles.cardTitle}>
                  <span>HD Form Guides</span>
                  <IoArrowForward className={styles.cardArrow} />
                </div>
                <p className={styles.cardDesc}>
                  Kinematic execution standards engineered for safety and hypertrophy.
                </p>
              </div>
            </Link>

            <Link href="/report/calorie" className={styles.pipelineCard}>
              <div className={styles.cardTopRow}>
                <span className={styles.cardIndex}>04 // METRICS</span>
                <span className={styles.cardIconBox} style={{ color: '#a855f7' }}>
                  <IoShieldCheckmarkOutline />
                </span>
              </div>
              <div className={styles.cardContent}>
                <div className={styles.cardTitle}>
                  <span>Biometric Analytics</span>
                  <IoArrowForward className={styles.cardArrow} />
                </div>
                <p className={styles.cardDesc}>
                  Scientific calorie, water, sleep, and step trend telemetry.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Target Metrics */}
      <HomeBanner1 />

      {/* Video Workout Categories */}
      <HomeBanner2 />

      {/* Footer */}
      <Footer />
    </main>
  )
}

export default Home
