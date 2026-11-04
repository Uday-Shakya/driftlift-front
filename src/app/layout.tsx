import Navbar from '@/app/components/Navbar'
import ToastProvider from '@/app/components/ToastProvider'
import { AuthProvider } from '@/context/AuthContext'
import RouteGuard from '@/app/components/AuthGuard/RouteGuard'
import './globals.css'
import '@fontsource/inter'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'DriftLift - Pro Fitness Platform',
  description: 'HD Video Form Tutorials, Live Workout Sessions, and Biometric Tracking',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar />
          <RouteGuard>
            {children}
          </RouteGuard>
          <ToastProvider />
        </AuthProvider>
      </body>
    </html>
  )
}
