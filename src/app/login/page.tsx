'use client'

import React, { Suspense } from 'react'
import AuthGateScreen from '@/app/components/AuthGate/AuthGateScreen'

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '80vh' }} />}>
      <AuthGateScreen initialMode="login" />
    </Suspense>
  )
}
