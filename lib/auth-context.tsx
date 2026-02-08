'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'

export interface User {
  id: string
  email: string
  name: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, name: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const decodeJwtPayload = (token: string) => {
    const parts = token.split('.')
    if (parts.length < 2) return null
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
    try {
      const json = atob(padded)
      return JSON.parse(json)
    } catch {
      return null
    }
  }

  useEffect(() => {
    if (typeof window === 'undefined') return
    const token = localStorage.getItem('oree_token')
    if (!token) {
      setLoading(false)
      return
    }
    const payload = decodeJwtPayload(token) as {
      client_id?: string
      email?: string
      company_name?: string
      exp?: number
    } | null
    if (!payload || (payload.exp && payload.exp * 1000 < Date.now())) {
      localStorage.removeItem('oree_token')
      setUser(null)
      setLoading(false)
      return
    }
    setUser({
      id: String(payload.client_id || 'unknown'),
      email: payload.email || '',
      name: payload.company_name || payload.email?.split('@')[0] || ''
    })
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      const res = await fetch('/api/client/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(text || 'Login failed')
      }
      const data = await res.json()
      const client = data?.client || {}
      if (data?.token && typeof window !== 'undefined') {
        localStorage.setItem('oree_token', data.token)
      }
      setUser({
        id: String(client.id || 'unknown'),
        email: client.email || email,
        name: client.company_name || client.companyName || email.split('@')[0]
      })
    } catch (error) {
      console.error('Login error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signup = async (email: string, name: string, password: string) => {
    setLoading(true)
    try {
      if (email && name && password) {
        throw new Error('Signup is not available')
      }
    } catch (error) {
      console.error('Signup error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    const token = typeof window === 'undefined' ? null : localStorage.getItem('oree_token')
    try {
      if (token) {
        await fetch('/api/client/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
      }
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('oree_token')
      }
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
