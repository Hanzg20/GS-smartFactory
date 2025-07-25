import { create } from 'zustand'
import { auth } from '../lib/supabase'
import { User as SupabaseUser } from '@supabase/supabase-js'

interface User {
  id: string
  email?: string
  user_metadata?: any
  created_at: string
}

interface AuthState {
  user: User | null
  session: any | null
  loading: boolean
  error: string | null
  
  // Actions
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  setUser: (user: User | null) => void
  setSession: (session: any | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  resetError: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  loading: false,
  error: null,

  signIn: async (email: string, password: string) => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await auth.signIn(email, password)
      if (error) {
        set({ error: error.message, loading: false })
        return { error: error.message }
      }
      
      set({
        user: data.user as User,
        session: data.session,
        loading: false
      })
      return {}
    } catch (error: any) {
      const errorMessage = error.message || '登录失败'
      set({
        error: errorMessage,
        loading: false
      })
      return { error: errorMessage }
    }
  },

  signUp: async (email: string, password: string) => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await auth.signUp(email, password)
      if (error) throw error
      
      set({
        user: data.user as User,
        session: data.session,
        loading: false
      })
    } catch (error: any) {
      set({
        error: error.message || '注册失败',
        loading: false
      })
    }
  },

  signOut: async () => {
    set({ loading: true })
    try {
      const { error } = await auth.signOut()
      if (error) throw error
      
      set({
        user: null,
        session: null,
        loading: false
      })
    } catch (error: any) {
      set({
        error: error.message || '登出失败',
        loading: false
      })
    }
  },

  setUser: (user: User | null) => set({ user }),
  setSession: (session: any | null) => set({ session }),
  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: string | null) => set({ error }),
  resetError: () => set({ error: null })
})) 