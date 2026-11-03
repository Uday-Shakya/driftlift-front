'use client'

import React, { Suspense } from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import AuthGateScreen from '../AuthGate/AuthGateScreen'

// List of public routes accessible without signing in
const PUBLIC_ROUTES = ['/', '/about', '/login', '/signup']

export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { isLoggedIn, loading } = useAuth()

  // Always allow public routes
  const isPublic = PUBLIC_ROUTES.includes(pathname || '/')

  if (isPublic) {
    return <>{children}</>
  }

  // If initial auth check is ongoing, show high-tech minimal loader
  if (loading) {
    return (
      <div
        style={{
          minHeight: '70vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          color: '#94a3b8',
          fontFamily: 'var(--font-heading)',
        }}
      >
        <div
          style={{
            width: '42px',
            height: '42px',
            border: '3px solid rgba(16, 185, 129, 0.2)',
            borderTopColor: '#10b981',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <span style={{ fontSize: '0.9rem', letterSpacing: '0.05em' }}>
          VERIFYING DRIFTLIFT CREDENTIALS...
        </span>
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
        <AuthGateScreen featureName={featureName} redirectPath={pathname || '/'} />
      </Suspense>
    )
  }

  return <>{children}</>
}
