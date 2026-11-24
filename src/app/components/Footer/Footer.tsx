'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import logo from '@/app/assets/logo.png'
import styles from './Footer.module.css'
import {
  IoMailOutline,
  IoCallOutline,
  IoLocationOutline,
  IoArrowForward,
  IoShieldCheckmarkOutline
} from 'react-icons/io5'

const Footer = () => {
  return (
    <footer className={styles.footer} id="footer">
      <div className={styles.footerContainer}>
        {/* Top Status & Brand Strip */}
        <div className={styles.footerTopBanner}>
          <div className={styles.systemStatusBlock}>
            <span className={styles.statusLiveDot} />
            <span className={styles.statusText}>ALL KINEMATIC & TELEMETRY ENGINES OPERATIONAL</span>
          </div>
          <div className={styles.engineBuild}>BUILD // v2.4.2 PRODUCTION READY</div>
        </div>

        <div className={styles.footerGrid}>
          {/* Brand Col */}
          <div className={styles.brandCol}>
            <div className={styles.logoRow}>
              <div className={styles.logoFrame}>
                <Image src={logo} alt="DriftLift" width={28} height={28} />
              </div>
              <span className={styles.brandName}>
                DRIFT<span className={styles.brandHighlight}>LIFT</span>
              </span>
            </div>
            <p className={styles.brandMotto}>
              The high-performance athletic operating system. Delivering HD video form standards,
              real-time computer vision joint tracking, 3D kinetic recovery maps, and
              offline-first biometric telemetry.
            </p>
          </div>

          {/* AI Suite */}
          <div className={styles.linksCol}>
            <h4 className={styles.colTitle}>AI Suite</h4>
            <ul className={styles.linksList}>
              <li><Link href="/vision-coach">AI Vision Coach</Link></li>
              <li><Link href="/food-scanner">Food & Plate Scanner</Link></li>
              <li><Link href="/heatmap">3D Muscle Heatmap</Link></li>
              <li><Link href="/squad-rooms">Multiplayer Squad Rooms</Link></li>
              <li><Link href="/offline">Offline Gym Hub</Link></li>
            </ul>
          </div>

          {/* Training & Analytics */}
          <div className={styles.linksCol}>
            <h4 className={styles.colTitle}>Platform</h4>
            <ul className={styles.linksList}>
              <li><Link href="/">Dashboard</Link></li>
              <li><Link href="/workout/chest">Video Form Guides</Link></li>
              <li><Link href="/report/calorie">Analytics & Telemetry</Link></li>
              <li><Link href="/profile">BMR & TDEE Engine</Link></li>
              <li><Link href="/about">About DriftLift</Link></li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div className={styles.contactCol}>
            <h4 className={styles.colTitle}>Engineering & Support</h4>
            <ul className={styles.contactList}>
              <li>
                <IoMailOutline className={styles.contactIcon} />
                <a href="mailto:udayshak8962@gmail.com">udayshak8962@gmail.com</a>
              </li>
              <li>
                <IoCallOutline className={styles.contactIcon} />
                <span>+91 7970240476</span>
              </li>
              <li>
                <IoLocationOutline className={styles.contactIcon} />
                <span>Global Kinetic Lab</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal Bar */}
        <div className={styles.footerBottom}>
          <p>© {new Date().getFullYear()} DriftLift Pro Platform. All rights reserved.</p>
          <div className={styles.footerBottomLinks}>
            <span>Biomechanical Standards</span>
            <span className={styles.dividerDot}>•</span>
            <span>Local IndexedDB Privacy</span>
            <span className={styles.dividerDot}>•</span>
            <span>Zero-Telemetry Leak</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
