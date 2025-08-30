import React, { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext'
import { Profile } from '@/lib/supabase'

interface UserContextType {
  profile: Profile | null
  refreshProfile: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { user, profile } = useAuth()
  const [userProfile, setUserProfile] = useState<Profile | null>(null)

  useEffect(() => {
    if (profile) {
      setUserProfile(profile)
    }
  }, [profile])

  const refreshProfile = async () => {
    // This will be handled by the AuthContext
    // We can add additional logic here if needed
  }

  const value = {
    profile: userProfile,
    refreshProfile,
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}