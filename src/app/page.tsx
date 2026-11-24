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
  IoLayersOutline,
  IoScanOutline,
  IoPeopleOutline,
  IoCloudOfflineOutline,
  IoCheckmarkCircle,
  IoRadioOutline
} from 'react-icons/io5'

type ModuleType = 'vision' | 'foodScanner' | 'heatmap' | 'squad' | 'offline'

interface TelemetryConfig {
  badge: string
  title: string
  summary: string
  icon: any
  accentColor: string
  linkHref: string
  linkText: string
  statusTag: string
  specs: Array<{ label: string; value: string; note: string }>
}

const TELEMETRY_MODULES: Record<ModuleType, TelemetryConfig> = {
  vision: {
    badge: 'MEDIA-PIPE INFERENCE',
    title: 'Optical Vision Coach',
    summary: 'Direct skeletal joint telemetry calculated via neural vision. Tracks concentric/eccentric tempo and flags joint collapse in real time.',
    icon: IoCameraOutline,
    accentColor: '#10b981',
    linkHref: '/vision-coach',
    linkText: 'Launch Optical Engine',
    statusTag: '60 FPS // ZERO LATENCY',
    specs: [
      { label: 'Joint Flexion Angle', value: '94.2°', note: 'Standard squat depth met' },
      { label: 'Eccentric Cadence', value: '2.4s', note: 'Controlled velocity' },
      { label: 'Completed Reps', value: '12 / 15', note: 'Concentric peak verified' },
      { label: 'Inference Precision', value: '99.4%', note: '33 3D skeletal landmarks' },
    ],
  },
  foodScanner: {
    badge: 'MULTIMODAL VISION AI',
    title: 'Snap & Log Food Scanner',
    summary: 'Computer-vision plate macro analysis. Instantly decomposes meals into exact protein, carbohydrate, lipid, and fiber ratios.',
    icon: IoScanOutline,
    accentColor: '#14b8a6',
    linkHref: '/food-scanner',
    linkText: 'Launch Plate Scanner',
    statusTag: 'GEMINI MULTIMODAL API',
    specs: [
      { label: 'Protein Synthesis', value: '42g', note: 'Optimal per-meal leucine' },
      { label: 'Complex Carbs', value: '58g', note: 'Glycogen replenishment' },
      { label: 'Essential Lipids', value: '14g', note: 'Hormonal support' },
      { label: 'Total Energy', value: '526 kcal', note: 'Synchronized with TDEE' },
    ],
  },
  heatmap: {
    badge: '3D KINETIC TOPOGRAPHY',
    title: '3D Muscle Fatigue Heatmap',
    summary: 'Dynamic recovery indexing and volume load across all 14 biomechanical muscle splits. Prevents overtraining through scientific DOMS telemetry.',
    icon: IoSparklesOutline,
    accentColor: '#06b6d4',
    linkHref: '/heatmap',
    linkText: 'Inspect 3D Heatmap',
    statusTag: 'THREE.JS ACCELERATED',
    specs: [
      { label: 'Pectoralis Major', value: '84%', note: 'Prime readiness / Loadable' },
      { label: 'Latissimus Dorsi', value: '91%', note: 'Full recovery threshold' },
      { label: 'Quadriceps Group', value: '42%', note: 'Active hypertrophic DOMS' },
      { label: 'System Readiness', value: '78 / 100', note: 'High capacity for training' },
    ],
  },
  squad: {
    badge: 'WEBSOCKET SYNCHRONIZATION',
    title: 'Multiplayer Squad Rooms',
    summary: 'Synchronized rest timers, shared training rooms, live set telemetry, and instant hype reactions for lifting partners worldwide.',
    icon: IoPeopleOutline,
    accentColor: '#f59e0b',
    linkHref: '/squad-rooms',
    linkText: 'Enter Squad Lounge',
    statusTag: 'RFC 6455 DUPLEX',
    specs: [
      { label: 'Active Roster', value: '4 Lifters', note: 'Marcus, Elena, Tariq, You' },
      { label: 'Rest Timer Delta', value: '< 8ms', note: 'Sub-frame synchronization' },
      { label: 'Active Routine', value: 'Push Heavy', note: 'Bench & Overhead press' },
      { label: 'Hype Reactions', value: 'Instant', note: 'Synthesized audio cues' },
    ],
  },
  offline: {
    badge: 'LOCAL-FIRST ARCHITECTURE',
    title: 'Offline Gym Hub & Cloud Sync',
    summary: 'Built for basement gyms and zero-signal barbell caves. Logs to local IndexedDB and automatically reconciles when reconnection occurs.',
    icon: IoCloudOfflineOutline,
    accentColor: '#f97316',
    linkHref: '/offline',
    linkText: 'Open Offline Hub',
    statusTag: 'INDEXED-DB REPLAY',
    specs: [
      { label: 'Local Persistence', value: '100% IDB', note: 'Zero cloud blocking' },
      { label: 'Sync Queue Replay', value: 'Automatic', note: 'Replays on reconnection' },
      { label: 'Service Worker', value: 'Active', note: 'Pre-cached static shell' },
      { label: 'Platform Mode', value: 'PWA Ready', note: 'Installable app experience' },
    ],
  },
}

const Home = () => {
  const [activeTab, setActiveTab] = useState<ModuleType>('vision')
  const currentModule = TELEMETRY_MODULES[activeTab]
  const IconComponent = currentModule.icon

  return (
    <main className={styles.main}>
      {/* ── Precision Hero Section ── */}
      <section className={styles.heroSection}>
        <div className={styles.heroHeaderArea}>
          <div className={styles.heroStatusChip}>
            <span className={styles.statusPulse} />
            <span className={styles.statusLabel}>DRIFTLIFT PRO OS // v2.4</span>
            <span className={styles.statusSeparator}>/</span>
            <span className={styles.statusContext}>KINEMATIC PLATFORM</span>
          </div>

          <h1 className={styles.heroTitle}>
            The athletic operating system for serious lifters.
          </h1>

          <p className={styles.heroLead}>
            Real-time skeletal joint analysis, interactive 3D recovery topographies, and
            offline-first biometric tracking. Built for athletes who measure progress with data,
            not guesswork.
          </p>

          <div className={styles.heroActionRow}>
            <Link href="/vision-coach" className="btn-primary">
              <IoCameraOutline size={18} />
              <span>Launch Vision Coach</span>
              <IoArrowForward size={15} />
            </Link>

            <Link href="/workout/chest" className="btn-secondary">
              <IoPlayCircleOutline size={18} />
              <span>Browse Form Repository</span>
            </Link>
          </div>

          {/* Quick-Launch Module Ribbon */}
          <div className={styles.quickLaunchRibbon}>
            <span className={styles.ribbonLabel}>QUICK LAUNCH:</span>
            <div className={styles.ribbonLinks}>
              <Link href="/vision-coach" className={styles.ribbonLink}>
                <IoCameraOutline size={14} className={styles.emerald} /> Vision Coach
              </Link>
              <span className={styles.ribbonDot}>•</span>
              <Link href="/food-scanner" className={styles.ribbonLink}>
                <IoScanOutline size={14} className={styles.teal} /> Food Scanner
              </Link>
              <span className={styles.ribbonDot}>•</span>
              <Link href="/heatmap" className={styles.ribbonLink}>
                <IoSparklesOutline size={14} className={styles.cyan} /> 3D Heatmap
              </Link>
              <span className={styles.ribbonDot}>•</span>
              <Link href="/squad-rooms" className={styles.ribbonLink}>
                <IoPeopleOutline size={14} className={styles.amber} /> Squad Rooms
              </Link>
              <span className={styles.ribbonDot}>•</span>
              <Link href="/offline" className={styles.ribbonLink}>
                <IoCloudOfflineOutline size={14} className={styles.orange} /> Offline Hub
              </Link>
            </div>
          </div>
        </div>

        {/* ── Interactive Kinematic Telemetry Deck ── */}
        <div className={styles.telemetryDeckWrapper}>
          <div className={styles.deckWindow}>
            {/* Window Top Titlebar */}
            <div className={styles.deckTitlebar}>
              <div className={styles.titlebarLeft}>
                <div className={styles.windowControls}>
                  <span className={styles.windowDot} />
                  <span className={styles.windowDot} />
                  <span className={styles.windowDot} />
                </div>
                <span className={styles.deckTitle}>DRIFTLIFT KINEMATIC CONSOLE</span>
              </div>
              <div className={styles.titlebarRight}>
                <span className={styles.moduleStatusTag}>{currentModule.statusTag}</span>
              </div>
            </div>

            {/* Segmented Module Navigation Tabs */}
            <div className={styles.segmentedTabs}>
              {(['vision', 'foodScanner', 'heatmap', 'squad', 'offline'] as ModuleType[]).map((tabKey) => {
                const mod = TELEMETRY_MODULES[tabKey]
                const TabIcon = mod.icon
                return (
                  <button
                    key={tabKey}
                    type="button"
                    onClick={() => setActiveTab(tabKey)}
                    className={`${styles.tabBtn} ${activeTab === tabKey ? styles.tabBtnActive : ''}`}
                  >
                    <TabIcon size={15} />
                    <span>{mod.title.split(' ')[0]}</span>
                  </button>
                )
              })}
            </div>

            {/* Console Body Area */}
            <div className={styles.deckContent}>
              <div className={styles.deckMetaHeader}>
                <div className={styles.deckMetaLeft}>
                  <span className={styles.deckBadge}>{currentModule.badge}</span>
                  <h2 className={styles.deckHeading}>{currentModule.title}</h2>
                  <p className={styles.deckSummary}>{currentModule.summary}</p>
                </div>

                <div className={styles.deckMetaAction}>
                  <Link href={currentModule.linkHref} className="btn-primary">
                    <span>{currentModule.linkText}</span>
                    <IoArrowForward size={15} />
                  </Link>
                </div>
              </div>

              {/* 4 Precision Spec Cells */}
              <div className={styles.specsGrid}>
                {currentModule.specs.map((item) => (
                  <div key={item.label} className={styles.specCard}>
                    <span className={styles.specCardLabel}>{item.label}</span>
                    <div className={styles.specCardValueRow}>
                      <span className={styles.specCardValue}>{item.value}</span>
                    </div>
                    <span className={styles.specCardNote}>{item.note}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Bento Architecture Strip ── */}
        <div className={styles.bentoSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionOverline}>ENGINEERED ARCHITECTURE</span>
            <h2 className={styles.sectionTitle}>Precision tools built for high-output training.</h2>
            <p className={styles.sectionLead}>
              Every module is designed to eliminate friction between your workout and your progression data.
            </p>
          </div>

          <div className={styles.bentoGrid}>
            <Link href="/vision-coach" className={styles.bentoCard}>
              <div className={styles.bentoHeader}>
                <div className={`${styles.bentoIconBox} ${styles.bgEmerald}`}>
                  <IoCameraOutline size={22} className={styles.emerald} />
                </div>
                <span className={styles.bentoTag}>01 // OPTICAL</span>
              </div>
              <h3 className={styles.bentoTitle}>AI Vision Coach</h3>
              <p className={styles.bentoDesc}>
                Real-time 33-point skeletal landmark detection directly in browser. Audio tempo cues and form breakdown without wearables.
              </p>
              <div className={styles.bentoFooter}>
                <span>Explore optical engine</span>
                <IoArrowForward size={14} className={styles.arrowIcon} />
              </div>
            </Link>

            <Link href="/food-scanner" className={styles.bentoCard}>
              <div className={styles.bentoHeader}>
                <div className={`${styles.bentoIconBox} ${styles.bgTeal}`}>
                  <IoScanOutline size={22} className={styles.teal} />
                </div>
                <span className={styles.bentoTag}>02 // MULTIMODAL</span>
              </div>
              <h3 className={styles.bentoTitle}>Snap & Log Food Scanner</h3>
              <p className={styles.bentoDesc}>
                Point camera at your meal. Advanced AI multimodal inference extracts protein, carbohydrate, and caloric metrics in one tap.
              </p>
              <div className={styles.bentoFooter}>
                <span>Decompose plate macros</span>
                <IoArrowForward size={14} className={styles.arrowIcon} />
              </div>
            </Link>

            <Link href="/heatmap" className={styles.bentoCard}>
              <div className={styles.bentoHeader}>
                <div className={`${styles.bentoIconBox} ${styles.bgCyan}`}>
                  <IoSparklesOutline size={22} className={styles.cyan} />
                </div>
                <span className={styles.bentoTag}>03 // TOPOGRAPHY</span>
              </div>
              <h3 className={styles.bentoTitle}>3D Muscle Heatmap</h3>
              <p className={styles.bentoDesc}>
                Interactive 3D anatomical model highlighting acute muscle fatigue and recovery readiness across 14 major kinetic chains.
              </p>
              <div className={styles.bentoFooter}>
                <span>View recovery map</span>
                <IoArrowForward size={14} className={styles.arrowIcon} />
              </div>
            </Link>

            <Link href="/offline" className={styles.bentoCard}>
              <div className={styles.bentoHeader}>
                <div className={`${styles.bentoIconBox} ${styles.bgOrange}`}>
                  <IoCloudOfflineOutline size={22} className={styles.orange} />
                </div>
                <span className={styles.bentoTag}>04 // LOCAL-FIRST</span>
              </div>
              <h3 className={styles.bentoTitle}>Offline Hub & Replay</h3>
              <p className={styles.bentoDesc}>
                Zero cellular connection needed. Native IndexedDB logging with background sync replay when you return to cell service.
              </p>
              <div className={styles.bentoFooter}>
                <span>Access offline hub</span>
                <IoArrowForward size={14} className={styles.arrowIcon} />
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
