import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Types for database tables
export interface Profile {
  id: string
  email: string
  full_name?: string
  artist_name?: string
  avatar_url?: string
  phone?: string
  location?: string
  bio?: string
  birth_date?: string
  pix_key?: string
  portfolio_url?: string
  instagram_url?: string
  youtube_url?: string
  soundcloud_url?: string
  presskit_url?: string
  is_admin: boolean
  created_at: string
  updated_at: string
}

export interface Event {
  id: string
  user_id: string
  event_name: string
  event_date: string
  event_time?: string
  location?: string
  producer_name?: string
  producer_contact?: string
  cache?: number
  status: 'pending' | 'confirmed' | 'cancelled'
  description?: string
  shared_with_admin: boolean
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  user_id: string
  title: string
  description?: string
  priority: 'high' | 'medium' | 'low'
  status: 'todo' | 'in_progress' | 'completed'
  deadline?: string
  shared_with_admin: boolean
  created_at: string
  updated_at: string
}

export interface MusicProject {
  id: string
  user_id: string
  name: string
  project_type: 'remix' | 'mashup' | 'set' | 'outro'
  participants?: string
  description?: string
  progress: number
  status: 'planning' | 'in_progress' | 'mixing' | 'mastering' | 'completed'
  deadline?: string
  shared_with_admin: boolean
  created_at: string
  updated_at: string
}

export interface InstagramPost {
  id: string
  user_id: string
  title: string
  content?: string
  post_type: 'foto' | 'reels' | 'carrossel' | 'story' | 'outro'
  image_url?: string
  publishing_date?: string
  observations?: string
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'published'
  shared_with_admin: boolean
  created_at: string
  updated_at: string
}

export interface Goal {
  id: string
  user_id: string
  title: string
  description?: string
  target_value: number
  current_value: number
  unit: string
  deadline?: string
  status: 'active' | 'completed' | 'cancelled'
  created_at: string
  updated_at: string
}

export interface Document {
  id: string
  user_id: string
  title: string
  description?: string
  file_url: string
  file_type: string
  file_size: number
  shared_with_admin: boolean
  created_at: string
  updated_at: string
}

// Helper functions for database operations
export const dbHelpers = {
  // Profile helpers
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) {
      console.error('Error fetching profile:', error)
      return null
    }
    
    return data
  },

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<boolean> {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
    
    if (error) {
      console.error('Error updating profile:', error)
      return false
    }
    
    return true
  },

  // Events helpers
  async getUserEvents(userId: string): Promise<Event[]> {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', userId)
      .order('event_date', { ascending: true })
    
    if (error) {
      console.error('Error fetching events:', error)
      return []
    }
    
    return data || []
  },

  async createEvent(event: Omit<Event, 'id' | 'created_at' | 'updated_at'>): Promise<Event | null> {
    const { data, error } = await supabase
      .from('events')
      .insert(event)
      .select()
      .single()
    
    if (error) {
      console.error('Error creating event:', error)
      return null
    }
    
    return data
  }
}