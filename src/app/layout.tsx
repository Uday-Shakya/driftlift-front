import Navbar from '@/app/components/Navbar'
import ToastProvider from '@/app/components/ToastProvider'
import { AuthProvider } from '@/context/AuthContext'
import RouteGuard from '@/app/components/AuthGuard/RouteGuard'
import PWAProvider from '@/app/components/PWA/PWAProvider'
import './globals.css'
import '@fontsource/inter'
import type { Metadata, Viewport } from 'next'

export const viewport: Viewport = {
  themeColor: '#07090e',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export const metadata: Metadata = {
  title: 'DriftLift - Pro Fitness Platform',
  description: 'HD Video Form Tutorials, Live Workout Sessions, and Biometric Tracking',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'DriftLift',
  },
  icons: {
    icon: '/icon.svg',
    apple: '/icon-192.png',
  },
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
          <PWAProvider>
            <Navbar />
            <RouteGuard>
              {children}
            </RouteGuard>
            <ToastProvider />
          </PWAProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
