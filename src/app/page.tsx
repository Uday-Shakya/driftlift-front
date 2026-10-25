"use client"

import React from 'react'
import Link from 'next/link'
import styles from './page.module.css'
import HomeBanner1 from '@/app/components/Homebanner1/HomeBanner1'
import HomeBanner2 from '@/app/components/HomeBanner2/HomeBanner2'
import Footer from './components/Footer/Footer'
import { IoPlayCircleOutline, IoCalculatorOutline, IoFlame, IoTrophy, IoShieldCheckmark } from 'react-icons/io5'

const Home = () => {
  return (
    <main className={styles.main}>
      {/* Hero Header Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroGlow}></div>
        <div className={styles.heroContent}>
          <div className="badge-glow">
            <IoFlame /> The Next-Gen Biometric & Workout Platform
          </div>

          <h1 className={styles.heroTitle}>
            ELEVATE YOUR FORM.<br />
            <span className={styles.heroGradient}>MASTER YOUR FITNESS.</span>
          </h1>

          <p className={styles.heroDescription}>
            DriftLift unites form-perfect HD video tutorials, intelligent live rest timers,
            and real-time metabolic tracking into one seamless, ultra-modern health interface.
          </p>

          <div className={styles.heroCtaGroup}>
            <Link href="/workout/chest" className="btn-primary">
              <IoPlayCircleOutline size={22} /> Explore Video Tutorials
            </Link>
            <Link href="/profile" className="btn-secondary">
              <IoCalculatorOutline size={20} /> Calculate BMR & TDEE
            </Link>
          </div>

          <div className={styles.statsStrip}>
            <div className={styles.statItem}>
              <IoTrophy className={styles.statIcon} />
              <div>
                <strong>Curated Workouts</strong>
                <span>With Form Execution Cues</span>
              </div>
            </div>
            <div className={styles.statItem}>
              <IoPlayCircleOutline className={styles.statIcon} />
              <div>
                <strong>HD Video Demos</strong>
                <span>Targeted Muscle Breakdown</span>
              </div>
            </div>
            <div className={styles.statItem}>
              <IoShieldCheckmark className={styles.statIcon} />
              <div>
                <strong>Smart Tracking</strong>
                <span>Water, Sleep, Macros & Steps</span>
              </div>
            </div>
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