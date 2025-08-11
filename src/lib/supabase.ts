import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'demo-key'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Fallback to localStorage if Supabase fails
export const saveFavorite = async (userId: string, song: any) => {
  try {
    const { data, error } = await supabase
      .from('favorites')
      .upsert({ user_id: userId, song_id: song.id, song_data: song })
    
    if (error) throw error
    return { success: true }
  } catch (error) {
    // Fallback to localStorage
    const key = `favorites-${userId}`
    const existing = JSON.parse(localStorage.getItem(key) || '[]')
    if (!existing.find((s: any) => s.id === song.id)) {
      existing.push(song)
      localStorage.setItem(key, JSON.stringify(existing))
    }
    return { success: true }
  }
}

export const getFavorites = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('song_data')
      .eq('user_id', userId)
    
    if (error) throw error
    return data?.map(item => item.song_data) || []
  } catch (error) {
    // Fallback to localStorage
    const key = `favorites-${userId}`
    return JSON.parse(localStorage.getItem(key) || '[]')
  }
}

export const saveRecentlyPlayed = async (userId: string, song: any) => {
  try {
    const { data, error } = await supabase
      .from('recently_played')
      .upsert({ user_id: userId, song_id: song.id, song_data: song, played_at: new Date() })
    
    if (error) throw error
    return { success: true }
  } catch (error) {
    // Fallback to localStorage
    const key = `recent-${userId}`
    const existing = JSON.parse(localStorage.getItem(key) || '[]')
    const filtered = existing.filter((s: any) => s.id !== song.id)
    filtered.unshift(song)
    localStorage.setItem(key, JSON.stringify(filtered.slice(0, 20)))
    return { success: true }
  }
}

export const getRecentlyPlayed = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('recently_played')
      .select('song_data')
      .eq('user_id', userId)
      .order('played_at', { ascending: false })
      .limit(20)
    
    if (error) throw error
    return data?.map(item => item.song_data) || []
  } catch (error) {
    // Fallback to localStorage
    const key = `recent-${userId}`
    return JSON.parse(localStorage.getItem(key) || '[]')
  }
}