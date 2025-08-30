import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, Profile } from '@/lib/supabase'
import { toast } from 'sonner'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  isAdmin: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName?: string) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<void>
  uploadAvatar: (file: File) => Promise<string>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        loadProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email)
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        await loadProfile(session.user.id)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadProfile = async (userId: string) => {
    try {
      console.log('Loading profile for user:', userId)
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile doesn't exist, create one
          console.log('Profile not found, creating new profile')
          await createProfile(userId)
        } else {
          console.error('Error loading profile:', error)
        }
      } else {
        console.log('Profile loaded:', data)
        setProfile(data)
      }
    } catch (error) {
      console.error('Error in loadProfile:', error)
    } finally {
      setLoading(false)
    }
  }

  const createProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: user?.email || '',
          full_name: user?.user_metadata?.full_name || '',
          is_admin: false
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating profile:', error)
      } else {
        console.log('Profile created:', data)
        setProfile(data)
      }
    } catch (error) {
      console.error('Error in createProfile:', error)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
      toast.success('Login realizado com sucesso!')
    } catch (error: any) {
      console.error('Sign in error:', error)
      toast.error(error.message || 'Erro ao fazer login')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || '',
          },
        },
      })

      if (error) throw error
      toast.success('Conta criada com sucesso! Verifique seu email.')
    } catch (error: any) {
      console.error('Sign up error:', error)
      toast.error(error.message || 'Erro ao criar conta')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      setUser(null)
      setProfile(null)
      setSession(null)
      toast.success('Logout realizado com sucesso!')
    } catch (error: any) {
      console.error('Sign out error:', error)
      toast.error(error.message || 'Erro ao fazer logout')
      throw error
    }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) throw new Error('No user logged in')

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', user.id)

      if (error) throw error

      // Update local state
      setProfile(prev => prev ? { ...prev, ...updates } : null)
      toast.success('Perfil atualizado com sucesso!')
    } catch (error: any) {
      console.error('Update profile error:', error)
      toast.error(error.message || 'Erro ao atualizar perfil')
      throw error
    }
  }

  const uploadAvatar = async (file: File): Promise<string> => {
    if (!user) throw new Error('No user logged in')

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/avatar.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      const avatarUrl = data.publicUrl

      // Update profile with new avatar URL
      await updateProfile({ avatar_url: avatarUrl })

      return avatarUrl
    } catch (error: any) {
      console.error('Avatar upload error:', error)
      toast.error(error.message || 'Erro ao fazer upload da imagem')
      throw error
    }
  }

  const value = {
    user,
    profile,
    session,
    loading,
    isAdmin: profile?.is_admin || false,
    signIn,
    signUp,
    signOut,
    updateProfile,
    uploadAvatar,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}