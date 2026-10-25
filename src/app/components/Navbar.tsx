'use client'

import React, { useState, useEffect } from 'react'
import logo from '@/app/assets/logo.png'
import { IoIosBody } from 'react-icons/io'
import { IoAddCircleOutline, IoLogOutOutline, IoMenu, IoClose } from 'react-icons/io5'
import './Navbar.css'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import AuthPopup from './AuthPopup/AuthPopup'
import QuickLogModal from './QuickLogModal/QuickLogModal'
import { toast } from 'react-toastify'

interface NavbarProps {
  scrollToFooter?: () => void
}

const Navbar: React.FC<NavbarProps> = ({ scrollToFooter }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false)
  const [user, setUser] = useState<any>(null)
  const [showAuthPopup, setShowAuthPopup] = useState<boolean>(false)
  const [showQuickLog, setShowQuickLog] = useState<boolean>(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false)

  const pathname = usePathname()
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:8000'

  const checkLogin = async () => {
    try {
      const res = await fetch(`${backendUrl}/auth/checklogin`, {
        method: 'POST',
        credentials: 'include',
      })
      const data = await res.json()
      if (data.ok) {
        setIsLoggedIn(true)
        setUser(data.user || null)
      } else {
        setIsLoggedIn(false)
        setUser(null)
      }
    } catch (err) {
      setIsLoggedIn(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch(`${backendUrl}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      })
      setIsLoggedIn(false)
      setUser(null)
      toast.info('Logged out successfully')
      window.location.reload()
    } catch (err) {
      toast.error('Logout failed')
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

  return (
    <>
      <header className="navbar-wrapper">
        <nav className="navbar-container glass-panel">
          {/* Logo & Brand */}
          <Link href="/" className="navbar-brand">
            <div className="brand-logo-glow">
              <Image src={logo} alt="DriftLift Logo" width={38} height={38} priority />
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
            <Link href="/workout/chest" className={`nav-link ${pathname?.startsWith('/workout') ? 'active' : ''}`}>
              Workouts & Tutorials
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
              onClick={() => setShowQuickLog(true)}
              title="Quick Log Metric"
            >
              <IoAddCircleOutline size={18} />
              <span>Log</span>
            </button>

            {isLoggedIn ? (
              <div className="user-profile-cluster">
                <Link href="/profile" className="profile-pill" title="View Profile">
                  <div className="avatar-circle">
                    <IoIosBody size={18} />
                  </div>
                  <span className="user-name-label">{user?.name ? user.name.split(' ')[0] : 'Profile'}</span>
                </Link>
                <button
                  className="nav-logout-btn"
                  onClick={handleLogout}
                  title="Logout"
                >
                  <IoLogOutOutline size={20} />
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