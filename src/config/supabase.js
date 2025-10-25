// Supabase configuration for Novellium
import { createClient } from '@supabase/supabase-js'

// Environment variables - these will be set in Vercel dashboard
// For client-side apps, use NEXT_PUBLIC_ prefix for Vercel deployment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 
                   (typeof window !== 'undefined' ? window.SUPABASE_URL : null) ||
                   'YOUR_SUPABASE_URL'

const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
                       (typeof window !== 'undefined' ? window.SUPABASE_ANON_KEY : null) ||
                       'YOUR_SUPABASE_ANON_KEY'

// Validate configuration
if (supabaseUrl === 'YOUR_SUPABASE_URL' || supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY') {
  console.warn('⚠️ Supabase environment variables not configured. Using fallback values.')
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Database table names
export const TABLES = {
  GAMES: 'games'
}

// Storage buckets
export const BUCKETS = {
  GAME_ASSETS: 'game-assets'
}

// Helper functions for common database operations
export class SupabaseGameManager {
  
  // Fetch all public games
  async getPublicGames() {
    try {
      const { data, error } = await supabase
        .from(TABLES.GAMES)
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching games:', error)
      return []
    }
  }

  // Get a specific game by ID
  async getGame(gameId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.GAMES)
        .select('*')
        .eq('id', gameId)
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching game:', error)
      return null
    }
  }

  // Get a specific game by game_id (URL slug)
  async getGameBySlug(gameSlug) {
    try {
      const { data, error } = await supabase
        .from(TABLES.GAMES)
        .select('*')
        .eq('game_id', gameSlug)
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching game by slug:', error)
      return null
    }
  }

  // Upload a new game (matches builder export format)
  async uploadGame(gameData) {
    try {
      const { data, error } = await supabase
        .from(TABLES.GAMES)
        .insert([{
          title: gameData.title,
          author: gameData.author,
          description: gameData.description || '',
          game_id: gameData.gameId || gameData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
          config: gameData.config,
          characters: gameData.characters,
          events: gameData.events,
          is_public: gameData.isPublic !== false,
          thumbnail_url: gameData.thumbnailUrl
        }])
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error uploading game:', error)
      throw error
    }
  }

  // Update an existing game
  async updateGame(gameId, gameData) {
    try {
      const { data, error } = await supabase
        .from(TABLES.GAMES)
        .update({
          title: gameData.title,
          author: gameData.author,
          description: gameData.description,
          config: gameData.config,
          characters: gameData.characters,
          events: gameData.events,
          is_public: gameData.isPublic,
          thumbnail_url: gameData.thumbnailUrl
        })
        .eq('id', gameId)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating game:', error)
      throw error
    }
  }

  // Upload game asset to storage
  async uploadAsset(gameId, file, fileName) {
    try {
      // Upload file to storage
      const filePath = `${gameId}/${fileName}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(BUCKETS.GAME_ASSETS)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })
      
      if (uploadError) throw uploadError

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(BUCKETS.GAME_ASSETS)
        .getPublicUrl(filePath)

      return urlData.publicUrl
    } catch (error) {
      console.error('Error uploading asset:', error)
      throw error
    }
  }

  // Increment download counter
  async incrementDownloads(gameId) {
    try {
      const { data, error } = await supabase
        .rpc('increment_download_count', { target_game_id: gameId })
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error incrementing downloads:', error)
    }
  }

  // Search games by title or author
  async searchGames(query) {
    try {
      const { data, error } = await supabase
        .from(TABLES.GAMES)
        .select('*')
        .or(`title.ilike.%${query}%,author.ilike.%${query}%,description.ilike.%${query}%`)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error searching games:', error)
      return []
    }
  }

  // Increment download count for a game
  async incrementDownloads(gameId) {
    try {
      const { data, error } = await supabase
        .rpc('increment_download_count', { target_game_id: gameId })
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error incrementing downloads:', error)
      throw error
    }
  }
}

// Export singleton instance
export const gameManager = new SupabaseGameManager()

// Connection test function
export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.from(TABLES.GAMES).select('count').limit(1)
    if (error) throw error
    console.log('✅ Supabase connection successful')
    return true
  } catch (error) {
    console.error('❌ Supabase connection failed:', error)
    return false
  }
}