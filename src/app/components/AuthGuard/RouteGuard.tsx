'use client'

import React, { Suspense } from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import AuthGateScreen from '../AuthGate/AuthGateScreen'

// List of public routes accessible without signing in
const PUBLIC_ROUTES = ['/', '/about', '/login', '/signup', '/offline']

export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { isLoggedIn, loading } = useAuth()

  // Always allow public routes
  const isPublic = PUBLIC_ROUTES.includes(pathname || '/')

  // If user is already logged in and visits login or signup, redirect home
  React.useEffect(() => {
    if (isLoggedIn && (pathname === '/login' || pathname === '/signup')) {
      if (typeof window !== 'undefined') {
        window.location.href = '/'
      }
    }
  }, [isLoggedIn, pathname])

  if (isPublic) {
    return <>{children}</>
  }

  if (loading) {
    return (
      <div className="page-loader">
        <div className="loader-spinner" />
        <span>Verifying session...</span>
      </div>
    )
  }

  // If user is not logged in on a protected route, show the Auth Gate Screen
  if (!isLoggedIn) {
    let featureName = 'DriftLift Pro Feature'
    if (pathname?.startsWith('/heatmap')) {
      featureName = '3D Kinetic Muscle Heatmap'
    } else if (pathname?.startsWith('/vision-coach')) {
      featureName = 'AI Optical Rep Counter & Vision Coach'
    } else if (pathname?.startsWith('/workout')) {
      featureName = 'HD Workout Tutorials'
    } else if (pathname?.startsWith('/report')) {
      featureName = 'Biometric Analytics & Reports'
    } else if (pathname?.startsWith('/profile')) {
      featureName = 'Athlete Profile & TDEE Engine'
    }

    return (
      <Suspense fallback={<div style={{ minHeight: '80vh' }} />}>
        <AuthGateScreen
          featureName={featureName}
          redirectPath={pathname || '/'}
          onSuccess={() => {
            if (typeof window !== 'undefined') {
              window.location.reload()
            }
          }}
        />
      </Suspense>
    )
  }

  return <>{children}</>
}
