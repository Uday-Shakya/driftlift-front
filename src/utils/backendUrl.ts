/**
 * Returns the backend API URL.
 * 1. Uses NEXT_PUBLIC_BACKEND_API if defined.
 * 2. If running in browser on localhost / 127.0.0.1, defaults to http://localhost:8000.
 * 3. In production (e.g. Vercel deployment), defaults to the Render cloud backend.
 */
export function getBackendUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_BACKEND_API
  if (envUrl && envUrl.trim() !== '') {
    return envUrl.trim().replace(/\/+$/, '')
  }

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:8000'
    }
  }

  // Deployed production fallback
  return 'https://driftlift-backend.onrender.com'
}
