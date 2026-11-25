'use client'

import React, { useState, useEffect, useRef } from 'react'
import logo from '@/app/assets/logo.png'
import {
  IoAddOutline,
  IoLogOutOutline,
  IoMenu,
  IoClose,
  IoChevronDown,
  IoSparklesOutline,
  IoCameraOutline,
  IoScanOutline,
  IoPeopleOutline,
  IoCloudOfflineOutline,
  IoPersonCircleOutline,
  IoFlameOutline,
  IoBarChartOutline,
  IoVideocamOutline
} from 'react-icons/io5'
import './Navbar.css'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import AuthPopup from './AuthPopup/AuthPopup'
import QuickLogModal from './QuickLogModal/QuickLogModal'
import { toast } from 'react-toastify'
import { useAuth } from '@/context/AuthContext'

interface NavbarProps {
  scrollToFooter?: () => void
}

const Navbar: React.FC<NavbarProps> = ({ scrollToFooter }) => {
  const { isLoggedIn, user, logout, checkLogin } = useAuth()
  const [showAuthPopup, setShowAuthPopup] = useState<boolean>(false)
  const [showQuickLog, setShowQuickLog] = useState<boolean>(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false)
  const [featuresDropdownOpen, setFeaturesDropdownOpen] = useState<boolean>(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const pathname = usePathname()

  const handleLogout = async () => {
    await logout()
    window.location.reload()
  }

  const handleQuickLogClick = () => {
    if (!isLoggedIn) {
      toast.info('Sign in to log your physical metrics')
      setShowAuthPopup(true)
    } else {
      setShowQuickLog(true)
    }
  }

  const handleContactClick = (e: React.MouseEvent) => {
    if (scrollToFooter) {
      e.preventDefault()
      scrollToFooter()
    } else {
      const footer = document.getElementById('footer')
      if (footer) {
        e.preventDefault()
        footer.scrollIntoView({ behavior: 'smooth' })
      }
    }
    setMobileMenuOpen(false)
  }

  useEffect(() => {
    checkLogin()
  }, [showAuthPopup])

  // Close dropdown and mobile menu on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setFeaturesDropdownOpen(false)
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setFeaturesDropdownOpen(false)
        setMobileMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  // Close dropdown on navigation
  useEffect(() => {
    setFeaturesDropdownOpen(false)
    setMobileMenuOpen(false)
  }, [pathname])

  const isAiFeatureActive =
    pathname === '/vision-coach' ||
    pathname === '/food-scanner' ||
    pathname === '/heatmap' ||
    pathname === '/squad-rooms' ||
    pathname === '/offline'

  return (
    <>
      <header className="navbar-wrapper">
        <nav className="navbar-container">
          {/* Logo & Brand */}
          <Link href="/" className="navbar-brand">
            <div className="brand-logo-frame">
              <Image src={logo} alt="DriftLift" width={26} height={26} priority />
            </div>
            <div className="brand-identity">
              <span className="brand-title">Drift<span className="brand-accent">Lift</span></span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="nav-links">
            <Link href="/" className={`nav-link ${pathname === '/' ? 'active' : ''}`}>
              Dashboard
            </Link>

            {/* AI Suite Dropdown */}
            <div className="nav-dropdown-wrapper" ref={dropdownRef}>
              <button
                type="button"
                className={`nav-link nav-dropdown-btn ${isAiFeatureActive ? 'active' : ''}`}
                onClick={() => setFeaturesDropdownOpen(!featuresDropdownOpen)}
                aria-expanded={featuresDropdownOpen}
              >
                <span>Tools</span>
                <IoChevronDown
                  size={12}
                  className={`dropdown-chevron ${featuresDropdownOpen ? 'rotated' : ''}`}
                />
              </button>

              {featuresDropdownOpen && (
                <div className="nav-dropdown-menu">
                  <div className="dropdown-section-header">Training &amp; Nutrition</div>
                  <Link
                    href="/vision-coach"
                    className={`dropdown-item ${pathname === '/vision-coach' ? 'active' : ''}`}
                  >
                    <div className="dropdown-item-icon">
                      <IoCameraOutline size={17} />
                    </div>
                    <div className="dropdown-item-text">
                      <span className="item-title">Vision Coach</span>
                      <span className="item-desc">Live pose tracking &amp; rep counter</span>
                    </div>
                  </Link>

                  <Link
                    href="/food-scanner"
                    className={`dropdown-item ${pathname === '/food-scanner' ? 'active' : ''}`}
                  >
                    <div className="dropdown-item-icon">
                      <IoScanOutline size={17} />
                    </div>
                    <div className="dropdown-item-text">
                      <span className="item-title">Food Scanner</span>
                      <span className="item-desc">Meal photo &amp; barcode macro log</span>
                    </div>
                  </Link>

                  <Link
                    href="/heatmap"
                    className={`dropdown-item ${pathname === '/heatmap' ? 'active' : ''}`}
                  >
                    <div className="dropdown-item-icon">
                      <IoSparklesOutline size={17} />
                    </div>
                    <div className="dropdown-item-text">
                      <span className="item-title">3D Muscle Heatmap</span>
                      <span className="item-desc">Muscle recovery &amp; fatigue map</span>
                    </div>
                  </Link>

                  <div className="dropdown-divider" />
                  <div className="dropdown-section-header">Sessions &amp; Offline</div>

                  <Link
                    href="/squad-rooms"
                    className={`dropdown-item ${pathname === '/squad-rooms' ? 'active' : ''}`}
                  >
                    <div className="dropdown-item-icon">
                      <IoPeopleOutline size={17} />
                    </div>
                    <div className="dropdown-item-text">
                      <span className="item-title">Squad Rooms</span>
                      <span className="item-desc">Shared rest timers &amp; live set logs</span>
                    </div>
                  </Link>

                  <Link
                    href="/offline"
                    className={`dropdown-item ${pathname === '/offline' ? 'active' : ''}`}
                  >
                    <div className="dropdown-item-icon">
                      <IoCloudOfflineOutline size={17} />
                    </div>
                    <div className="dropdown-item-text">
                      <span className="item-title">Offline Gym Hub</span>
                      <span className="item-desc">Local workout logging &amp; sync</span>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            <Link href="/workout/chest" className={`nav-link ${pathname?.startsWith('/workout') ? 'active' : ''}`}>
              Workouts
            </Link>
            <Link href="/report/calorie" className={`nav-link ${pathname?.startsWith('/report') ? 'active' : ''}`}>
              Analytics
            </Link>
            <Link href="/about" className={`nav-link ${pathname === '/about' ? 'active' : ''}`}>
              About
            </Link>
          </div>

          {/* Action Area */}
          <div className="nav-actions">
            {/* Quick Log Button */}
            <button
              className="quicklog-trigger-btn"
              onClick={handleQuickLogClick}
              title="Quick Log Telemetry"
            >
              <IoAddOutline size={16} />
              <span>Log Metric</span>
            </button>

            {isLoggedIn ? (
              <div className="user-profile-cluster">
                <Link href="/profile" className="profile-pill" title="View Profile">
                  <IoPersonCircleOutline size={18} />
                  <span className="user-name-label">{user?.name ? user.name.split(' ')[0] : 'Profile'}</span>
                </Link>
                <button
                  className="nav-logout-btn"
                  onClick={handleLogout}
                  title="Sign Out"
                  aria-label="Sign Out"
                >
                  <IoLogOutOutline size={16} />
                </button>
              </div>
            ) : (
              <button
                className="btn-primary nav-signin-btn"
                onClick={() => setShowAuthPopup(true)}
              >
                Sign In
              </button>
            )}

            {/* Mobile Menu Hamburger */}
            <button
              className="mobile-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <IoClose size={20} /> : <IoMenu size={20} />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div className="mobile-menu-drawer">
            <div className="mobile-section-label">Navigation</div>
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className={`mobile-nav-link ${pathname === '/' ? 'active' : ''}`}>
              Dashboard
            </Link>
            <Link href="/workout/chest" onClick={() => setMobileMenuOpen(false)} className={`mobile-nav-link ${pathname.startsWith('/workout') ? 'active' : ''}`}>
              Workouts & Tutorials
            </Link>
            <Link href="/report/calorie" onClick={() => setMobileMenuOpen(false)} className={`mobile-nav-link ${pathname.startsWith('/report') ? 'active' : ''}`}>
              Analytics & Vitals
            </Link>
            <Link href="/about" onClick={() => setMobileMenuOpen(false)} className={`mobile-nav-link ${pathname === '/about' ? 'active' : ''}`}>
              About DriftLift
            </Link>

            <div className="mobile-section-label">Tools</div>
            <Link href="/vision-coach" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">
              <IoCameraOutline size={16} />
              <span>Vision Coach</span>
            </Link>
            <Link href="/food-scanner" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">
              <IoScanOutline size={16} />
              <span>Food Scanner</span>
            </Link>
            <Link href="/heatmap" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">
              <IoSparklesOutline size={16} />
              <span>3D Muscle Heatmap</span>
            </Link>
            <Link href="/squad-rooms" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">
              <IoPeopleOutline size={16} />
              <span>Squad Rooms</span>
            </Link>
            <Link href="/offline" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">
              <IoCloudOfflineOutline size={16} />
              <span>Offline Gym Hub</span>
            </Link>

            {isLoggedIn ? (
              <div className="mobile-user-footer">
                <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="mobile-profile-link">
                  <IoPersonCircleOutline size={20} />
                  <span>Profile & TDEE</span>
                </Link>
                <button onClick={handleLogout} className="mobile-logout-btn">
                  <IoLogOutOutline size={16} /> Sign Out
                </button>
              </div>
            ) : (
              <div className="mobile-auth-footer">
                <button
                  className="btn-primary w-full"
                  onClick={() => {
                    setMobileMenuOpen(false)
                    setShowAuthPopup(true)
                  }}
                >
                  Sign In to DriftLift
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Popups */}
      {showAuthPopup && <AuthPopup setShowpopup={setShowAuthPopup} />}
      <QuickLogModal isOpen={showQuickLog} onClose={() => setShowQuickLog(false)} onSuccess={checkLogin} />
    </>
  )
}

export default Navbar
