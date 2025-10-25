// Supabase configuration for Novellium
import { createClient } from '@supabase/supabase-js'

// Environment variables (set these in Vercel dashboard)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'

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
  GAMES: 'games',
  GAME_ASSETS: 'game_assets',
  GAME_DOWNLOADS: 'game_downloads'
}

// Storage buckets
export const BUCKETS = {
  GAME_ASSETS: 'game-assets',
  GAME_THUMBNAILS: 'game-thumbnails'
}

// Helper functions for common database operations
export class SupabaseGameManager {
  
  // Fetch all public games
  async getPublicGames() {
    try {
      const { data, error } = await supabase
        .from(TABLES.GAMES)
        .select(`
          *,
          game_assets (
            id,
            asset_type,
            asset_name,
            file_path
          )
        `)
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
        .select(`
          *,
          game_assets (*)
        `)
        .eq('id', gameId)
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching game:', error)
      return null
    }
  }

  // Upload a new game
  async uploadGame(gameData) {
    try {
      const { data, error } = await supabase
        .from(TABLES.GAMES)
        .insert([{
          title: gameData.title,
          author: gameData.author,
          description: gameData.description,
          config: gameData.config,
          characters: gameData.characters,
          events: gameData.events,
          is_public: gameData.isPublic || true
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

  // Upload game assets (images, audio)
  async uploadAsset(gameId, file, assetType, assetName) {
    try {
      // Upload file to storage
      const fileName = `${gameId}/${assetType}/${assetName}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(BUCKETS.GAME_ASSETS)
        .upload(fileName, file)
      
      if (uploadError) throw uploadError

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(BUCKETS.GAME_ASSETS)
        .getPublicUrl(fileName)

      // Save asset reference in database
      const { data, error } = await supabase
        .from(TABLES.GAME_ASSETS)
        .insert([{
          game_id: gameId,
          asset_type: assetType,
          asset_name: assetName,
          file_path: urlData.publicUrl,
          file_size: file.size
        }])
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error uploading asset:', error)
      throw error
    }
  }

  // Increment download counter
  async incrementDownloads(gameId) {
    try {
      const { error } = await supabase
        .from(TABLES.GAMES)
        .update({ 
          download_count: supabase.rpc('increment_downloads', { game_id: gameId })
        })
        .eq('id', gameId)
      
      if (error) throw error
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