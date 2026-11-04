'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { toast } from 'react-toastify'
import { getBackendUrl } from '@/utils/backendUrl'

export interface UserProfile {
  _id: string
  name: string
  email: string
  gender?: string
  dob?: string
  goal?: string
  activityLevel?: string
  weight?: Array<{ weight: number; unit: string; date: string }>
  height?: Array<{ height: number; unit: string; date: string }>
}

interface AuthContextType {
  isLoggedIn: boolean
  user: UserProfile | null
  loading: boolean
  checkLogin: () => Promise<boolean>
  login: (email: string, password: string) => Promise<{ ok: boolean; message?: string }>
  register: (payload: Record<string, any>) => Promise<{ ok: boolean; message?: string }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  user: null,
  loading: true,
  checkLogin: async () => false,
  login: async () => ({ ok: false }),
  register: async () => ({ ok: false }),
  logout: async () => {},
})

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  const backendUrl = getBackendUrl()

  // Hydrate immediately from localStorage on client mount
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const storedToken = localStorage.getItem('driftlift_token')
        const storedUser = localStorage.getItem('user')
        if (storedToken && storedUser) {
          setIsLoggedIn(true)
          setUser(JSON.parse(storedUser))
          setLoading(false)
        }
      }
    } catch (e) {
      // ignore
    }
  }, [])

  const checkLogin = useCallback(async (): Promise<boolean> => {
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('driftlift_token') : null
    const storedUserStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      if (storedToken) {
        headers['Authorization'] = `Bearer ${storedToken}`
      }

      const res = await fetch(`${backendUrl}/auth/checklogin`, {
        method: 'POST',
        headers,
        credentials: 'include',
      })
      const data = await res.json().catch(() => null)
      if (res.ok && data?.ok) {
        setIsLoggedIn(true)
        setUser(data.user || null)
        if (typeof window !== 'undefined' && data.user) {
          localStorage.setItem('user', JSON.stringify(data.user))
        }
        return true
      } else if (res.status === 401 || res.status === 403) {
        // Explicit unauthorized from backend
        if (typeof window !== 'undefined') {
          localStorage.removeItem('driftlift_token')
          localStorage.removeItem('user')
        }
        setIsLoggedIn(false)
        setUser(null)
        return false
      } else {
        // Other HTTP status (500, 502, cold start) - fall back to stored credentials if present
        if (storedToken && storedUserStr) {
          try {
            setUser(JSON.parse(storedUserStr))
            setIsLoggedIn(true)
            return true
          } catch {}
        }
        setIsLoggedIn(false)
        setUser(null)
        return false
      }
    } catch {
      // Network failure / offline / Render cold start
      if (storedToken && storedUserStr) {
        try {
          setUser(JSON.parse(storedUserStr))
          setIsLoggedIn(true)
          return true
        } catch {}
      }
      setIsLoggedIn(false)
      setUser(null)
      return false
    } finally {
      setLoading(false)
    }
  }, [backendUrl])

  useEffect(() => {
    checkLogin()
  }, [checkLogin])

  const login = async (email: string, password: string): Promise<{ ok: boolean; message?: string }> => {
    try {
      const res = await fetch(`${backendUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json().catch(() => null)

      if (res.ok && data?.ok) {
        setIsLoggedIn(true)
        if (data.data?.authToken && typeof window !== 'undefined') {
          localStorage.setItem('driftlift_token', data.data.authToken)
        }
        if (data.data?.user) {
          setUser(data.data.user)
          if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(data.data.user))
          }
        } else {
          await checkLogin()
        }
        return { ok: true, message: data.message || 'Login successful' }
      } else {
        return { ok: false, message: data?.message || 'Invalid email or password' }
      }
    } catch (err: any) {
      return { ok: false, message: err?.message || 'Unable to connect to authentication server' }
    }
  }

  const register = async (payload: Record<string, any>): Promise<{ ok: boolean; message?: string }> => {
    try {
      const res = await fetch(`${backendUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => null)

      if (res.ok && data?.ok) {
        return { ok: true, message: data.message || 'Account created successfully' }
      } else {
        return { ok: false, message: data?.message || 'Failed to create account' }
      }
    } catch (err: any) {
      return { ok: false, message: err?.message || 'Network error during registration' }
    }
  }

  const logout = async () => {
    try {
      const storedToken = typeof window !== 'undefined' ? localStorage.getItem('driftlift_token') : null
      const headers: Record<string, string> = {}
      if (storedToken) {
        headers['Authorization'] = `Bearer ${storedToken}`
      }
      await fetch(`${backendUrl}/auth/logout`, {
        method: 'POST',
        headers,
        credentials: 'include',
      })
    } catch {
      // ignore
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('driftlift_token')
        localStorage.removeItem('user')
      }
      setIsLoggedIn(false)
      setUser(null)
      toast.info('Logged out')
    }
  }

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        user,
        loading,
        checkLogin,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
