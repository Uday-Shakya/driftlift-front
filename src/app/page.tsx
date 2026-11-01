"use client"

import React from 'react'
import Link from 'next/link'
import styles from './page.module.css'
import HomeBanner1 from '@/app/components/Homebanner1/HomeBanner1'
import HomeBanner2 from '@/app/components/HomeBanner2/HomeBanner2'
import Footer from './components/Footer/Footer'
import { IoPlayCircleOutline, IoCalculatorOutline, IoFlame, IoTrophy, IoShieldCheckmark, IoSparkles, IoCameraOutline } from 'react-icons/io5'

const Home = () => {
  return (
    <main className={styles.main}>
      {/* Hero Header Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroGlow}></div>
        <div className={styles.heroContent}>
          <div className="badge-glow">
            <IoSparkles /> Real-Time 3D Anatomical Heatmap & AI Vision Tracking
          </div>

          <h1 className={styles.heroTitle}>
            ELEVATE YOUR FORM.<br />
            <span className={styles.heroGradient}>MASTER YOUR FITNESS.</span>
          </h1>

          <p className={styles.heroDescription}>
            DriftLift unites Computer Vision real-time rep counting & form checking, 3D interactive
            muscle recovery heatmaps, intelligent live rest timers, and biometric tracking.
          </p>

          <div className={styles.heroCtaGroup}>
            <Link href="/vision-coach" className="btn-primary" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4)' }}>
              <IoCameraOutline size={20} /> AI Rep Counter
            </Link>
            <Link href="/heatmap" className="btn-primary" style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)', boxShadow: '0 4px 20px rgba(6, 182, 212, 0.4)' }}>
              <IoSparkles size={20} /> 3D Muscle Heatmap
            </Link>
            <Link href="/workout/chest" className="btn-secondary">
              <IoPlayCircleOutline size={22} /> Video Tutorials
            </Link>
            <Link href="/profile" className="btn-secondary">
              <IoCalculatorOutline size={20} /> BMR & TDEE
            </Link>
          </div>

          {/* Interactive Feature Highlights Bento Grid */}
          <div className={styles.featuresBentoGrid}>
            <Link href="/vision-coach" className={styles.featureCard}>
              <div
                className={styles.featureIconWrapper}
                style={{
                  color: '#10b981',
                  background: 'rgba(16, 185, 129, 0.12)',
                  borderColor: 'rgba(16, 185, 129, 0.35)',
                }}
              >
                <IoCameraOutline size={24} />
              </div>
              <div className={styles.featureText}>
                <strong>AI Vision Coach</strong>
                <span>Optical Reps & Live Form Cues</span>
              </div>
            </Link>

            <Link href="/heatmap" className={styles.featureCard}>
              <div
                className={styles.featureIconWrapper}
                style={{
                  color: '#06b6d4',
                  background: 'rgba(6, 182, 212, 0.12)',
                  borderColor: 'rgba(6, 182, 212, 0.35)',
                }}
              >
                <IoSparkles size={24} />
              </div>
              <div className={styles.featureText}>
                <strong>3D Muscle Heatmap</strong>
                <span>Kinetic Recovery & DOMS Scan</span>
              </div>
            </Link>

            <Link href="/workout/chest" className={styles.featureCard}>
              <div
                className={styles.featureIconWrapper}
                style={{
                  color: '#f59e0b',
                  background: 'rgba(245, 158, 11, 0.12)',
                  borderColor: 'rgba(245, 158, 11, 0.35)',
                }}
              >
                <IoPlayCircleOutline size={24} />
              </div>
              <div className={styles.featureText}>
                <strong>HD Form Tutorials</strong>
                <span>Curated Muscle Execution Guides</span>
              </div>
            </Link>

            <Link href="/report/calorie" className={styles.featureCard}>
              <div
                className={styles.featureIconWrapper}
                style={{
                  color: '#a855f7',
                  background: 'rgba(168, 85, 247, 0.12)',
                  borderColor: 'rgba(168, 85, 247, 0.35)',
                }}
              >
                <IoShieldCheckmark size={24} />
              </div>
              <div className={styles.featureText}>
                <strong>Smart Tracking</strong>
                <span>Water, Sleep, Macros & Steps</span>
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