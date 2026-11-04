'use client'

import React, { useState, useEffect, useRef } from 'react'
import logo from '@/app/assets/logo.png'
import { IoIosBody } from 'react-icons/io'
import {
  IoAddCircleOutline,
  IoLogOutOutline,
  IoMenu,
  IoClose,
  IoChevronDown,
  IoSparklesOutline,
  IoCameraOutline,
  IoScanOutline,
  IoPeopleOutline,
  IoCloudOfflineOutline
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
      toast.info('Please sign in to log your physical metrics')
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

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setFeaturesDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
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
        <nav className="navbar-container glass-panel">
          {/* Logo & Brand */}
          <Link href="/" className="navbar-brand">
            <div className="brand-logo-glow">
              <Image src={logo} alt="DriftLift Logo" width={32} height={32} priority />
            </div>
            <div className="brand-text">
              <span className="brand-title">DRIFT<span className="brand-highlight">LIFT</span></span>
              <span className="brand-tagline">Pro Fitness</span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="nav-links">
            <Link href="/" className={`nav-link ${pathname === '/' ? 'active' : ''}`}>
              Dashboard
            </Link>

            {/* Clean AI Features Dropdown */}
            <div className="nav-dropdown-wrapper" ref={dropdownRef}>
              <button
                type="button"
                className={`nav-link nav-dropdown-btn ${isAiFeatureActive ? 'active' : ''}`}
                onClick={() => setFeaturesDropdownOpen(!featuresDropdownOpen)}
                aria-expanded={featuresDropdownOpen}
              >
                <span>AI Features</span>
                <IoChevronDown
                  size={13}
                  className={`dropdown-chevron ${featuresDropdownOpen ? 'rotated' : ''}`}
                />
              </button>

              {featuresDropdownOpen && (
                <div className="nav-dropdown-menu">
                  <Link
                    href="/vision-coach"
                    className={`dropdown-item ${pathname === '/vision-coach' ? 'active' : ''}`}
                  >
                    <div className="dropdown-item-icon icon-emerald">
                      <IoCameraOutline size={18} />
                    </div>
                    <div className="dropdown-item-text">
                      <span className="item-title">AI Vision Coach</span>
                      <span className="item-desc">Optical rep counter & form check</span>
                    </div>
                  </Link>

                  <Link
                    href="/food-scanner"
                    className={`dropdown-item ${pathname === '/food-scanner' ? 'active' : ''}`}
                  >
                    <div className="dropdown-item-icon icon-teal">
                      <IoScanOutline size={18} />
                    </div>
                    <div className="dropdown-item-text">
                      <span className="item-title">AI Food Scanner</span>
                      <span className="item-desc">Snap & log plate macros</span>
                    </div>
                  </Link>

                  <Link
                    href="/heatmap"
                    className={`dropdown-item ${pathname === '/heatmap' ? 'active' : ''}`}
                  >
                    <div className="dropdown-item-icon icon-cyan">
                      <IoSparklesOutline size={18} />
                    </div>
                    <div className="dropdown-item-text">
                      <span className="item-title">3D Muscle Heatmap</span>
                      <span className="item-desc">Recovery & DOMS scanner</span>
                    </div>
                  </Link>

                  <Link
                    href="/squad-rooms"
                    className={`dropdown-item ${pathname === '/squad-rooms' ? 'active' : ''}`}
                  >
                    <div className="dropdown-item-icon icon-amber">
                      <IoPeopleOutline size={18} />
                    </div>
                    <div className="dropdown-item-text">
                      <span className="item-title">Multiplayer Squad Rooms</span>
                      <span className="item-desc">Synced rest timers & live hype</span>
                    </div>
                  </Link>

                  <Link
                    href="/offline"
                    className={`dropdown-item ${pathname === '/offline' ? 'active' : ''}`}
                  >
                    <div className="dropdown-item-icon icon-orange">
                      <IoCloudOfflineOutline size={18} />
                    </div>
                    <div className="dropdown-item-text">
                      <span className="item-title">Offline Gym Hub</span>
                      <span className="item-desc">Basement workouts & cloud sync</span>
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
            <a href="#footer" onClick={handleContactClick} className="nav-link">
              Contact
            </a>
          </div>

          {/* Action Area */}
          <div className="nav-actions">
            {/* Quick Log Button */}
            <button
              className="quicklog-trigger-btn"
              onClick={handleQuickLogClick}
              title="Quick Log Metric"
            >
              <IoAddCircleOutline size={17} />
              <span>Log</span>
            </button>

            {isLoggedIn ? (
              <div className="user-profile-cluster">
                <Link href="/profile" className="profile-pill" title="View Profile">
                  <div className="avatar-circle">
                    <IoIosBody size={16} />
                  </div>
                  <span className="user-name-label">{user?.name ? user.name.split(' ')[0] : 'Profile'}</span>
                </Link>
                <button
                  className="nav-logout-btn"
                  onClick={handleLogout}
                  title="Logout"
                >
                  <IoLogOutOutline size={19} />
                </button>
              </div>
            ) : (
              <button
                className="btn-primary login-btn"
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
              {mobileMenuOpen ? <IoClose size={24} /> : <IoMenu size={24} />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="mobile-menu-drawer glass-panel">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">
              Dashboard
            </Link>

            <div className="mobile-section-label">AI Features</div>
            <Link href="/vision-coach" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link sub">
              <IoCameraOutline size={18} /> AI Vision Coach
            </Link>
            <Link href="/food-scanner" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link sub">
              <IoScanOutline size={18} /> AI Food Scanner
            </Link>
            <Link href="/heatmap" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link sub">
              <IoSparklesOutline size={18} /> 3D Muscle Heatmap
            </Link>
            <Link href="/squad-rooms" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link sub">
              <IoPeopleOutline size={18} /> Multiplayer Squad Rooms
            </Link>
            <Link href="/offline" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link sub">
              <IoCloudOfflineOutline size={18} /> Offline Gym Hub
            </Link>

            <div className="mobile-section-label">Core</div>
            <Link href="/workout/chest" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">
              Workouts & Tutorials
            </Link>
            <Link href="/report/calorie" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">
              Analytics
            </Link>
            <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">
              About
            </Link>
            <a href="#footer" onClick={handleContactClick} className="mobile-nav-link">
              Contact
            </a>
            {isLoggedIn && (
              <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link highlight">
                User Profile & TDEE
              </Link>
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
