"use client"

import React from 'react'
import Link from 'next/link'
import styles from './page.module.css'
import HomeBanner1 from '@/app/components/Homebanner1/HomeBanner1'
import HomeBanner2 from '@/app/components/HomeBanner2/HomeBanner2'
import Footer from './components/Footer/Footer'
import {
  IoCameraOutline,
  IoSparklesOutline,
  IoArrowForward,
  IoScanOutline,
  IoPeopleOutline,
  IoCloudOfflineOutline
} from 'react-icons/io5'

const TOOLS = [
  {
    href: '/vision-coach',
    icon: IoCameraOutline,
    title: 'Vision Coach',
    desc: 'Live camera pose tracking, rep counting, and spoken form cues.',
  },
  {
    href: '/food-scanner',
    icon: IoScanOutline,
    title: 'Food Scanner',
    desc: 'Snap a meal photo or barcode to log calories and macros.',
  },
  {
    href: '/heatmap',
    icon: IoSparklesOutline,
    title: '3D Muscle Heatmap',
    desc: 'Track soreness and recovery readiness across 14 muscle groups.',
  },
  {
    href: '/squad-rooms',
    icon: IoPeopleOutline,
    title: 'Squad Rooms',
    desc: 'Train with friends using shared rest timers and live set logs.',
  },
  {
    href: '/offline',
    icon: IoCloudOfflineOutline,
    title: 'Offline Gym Hub',
    desc: 'Log sets without signal and auto-sync when back online.',
  },
]

const Home = () => {
  return (
    <main className={styles.main}>
      {/* ── Editorial Split Hero ── */}
      <section className={styles.heroSection}>
        <div className={styles.heroGrid}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              Form, recovery, and daily tracking in one place.
            </h1>
            <p className={styles.heroLead}>
              Check your rep depth with live pose detection, log meals from a photo,
              and see which muscle groups are ready to train. Built to work online or offline.
            </p>
            <div className={styles.heroActions}>
              <Link href="/vision-coach" className="btn-primary">
                <span>Open Vision Coach</span>
                <IoArrowForward size={16} />
              </Link>
              <Link href="/workout/chest" className="btn-secondary">
                <span>Browse Workouts</span>
              </Link>
            </div>
          </div>

          <div className={styles.heroMedia}>
            <img
              src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80"
              alt="Athlete training in gym"
              className={styles.heroImage}
            />
          </div>
        </div>

        {/* ── Clean Tool Index Strip ── */}
        <div className={styles.toolsStrip}>
          {TOOLS.map((tool) => {
            const Icon = tool.icon
            return (
              <Link key={tool.href} href={tool.href} className={styles.toolItem}>
                <div className={styles.toolHeader}>
                  <Icon size={18} className={styles.toolIcon} />
                  <span className={styles.toolTitle}>{tool.title}</span>
                </div>
                <p className={styles.toolDesc}>{tool.desc}</p>
              </Link>
            )
          })}
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
