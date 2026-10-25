import Navbar from '@/app/components/Navbar'
import ToastProvider from '@/app/components/ToastProvider'
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

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
      <body className={inter.className}>
        <Navbar />
        {children}
        <ToastProvider />
      </body>
    </html>
  )
}