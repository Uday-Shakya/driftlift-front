'use client'

import React, { Suspense } from 'react'
import AuthGateScreen from '@/app/components/AuthGate/AuthGateScreen'

export default function SignupPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '80vh' }} />}>
      <AuthGateScreen initialMode="signup" />
    </Suspense>
  )
}
