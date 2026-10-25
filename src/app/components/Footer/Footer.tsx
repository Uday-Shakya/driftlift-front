'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import logo from '@/app/assets/logo.png'
import styles from './Footer.module.css'
import { IoMailOutline, IoCallOutline, IoLocationOutline, IoHeart } from 'react-icons/io5'

const Footer = () => {
  return (
    <footer className={styles.footer} id="footer">
      <div className={styles.footerContainer}>
        <div className={styles.footerTop}>
          {/* Brand Col */}
          <div className={styles.brandCol}>
            <div className={styles.logoRow}>
              <Image src={logo} alt="DriftLift" width={36} height={36} />
              <span className={styles.brandName}>
                DRIFT<span className={styles.brandHighlight}>LIFT</span>
              </span>
            </div>
            <p className={styles.brandMotto}>
              Empowering athletes and fitness enthusiasts with HD video form tutorials,
              intelligent live workout sessions, and personalized biometric tracking.
            </p>
          </div>

          {/* Quick Links */}
          <div className={styles.linksCol}>
            <h4>Explore Platform</h4>
            <ul>
              <li><Link href="/">Dashboard</Link></li>
              <li><Link href="/workout/chest">Video Form Guides</Link></li>
              <li><Link href="/report/calorie">Analytics & Reports</Link></li>
              <li><Link href="/profile">BMR & TDEE Calculator</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className={styles.contactCol}>
            <h4>Get in Touch</h4>
            <ul>
              <li>
                <IoMailOutline />
                <a href="mailto:udayshak8962@gmail.com">udayshak8962@gmail.com</a>
              </li>
              <li>
                <IoCallOutline />
                <span>+91 7970240476</span>
              </li>
              <li>
                <IoLocationOutline />
                <span>Global Fitness Hub</span>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <p>© {new Date().getFullYear()} DriftLift Pro. All rights reserved.</p>
          <p className={styles.loveTag}>
            Built with <IoHeart className={styles.heartIcon} /> for peak fitness performance.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
