// Cloud Game Manager - Integrates cloud games with local Novellium engine
// File: src/managers/CloudGameManager.js

export class CloudGameManager {
  constructor() {
    this.apiBaseUrl = '/api' // Vercel API endpoints
    this.isOnline = navigator.onLine
    this.cloudEnabled = true
    this.cache = new Map()
    
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true
      console.log('📡 Cloud connection restored')
    })
    
    window.addEventListener('offline', () => {
      this.isOnline = false
      console.log('📡 Cloud connection lost - using local fallback')
    })
  }

  // Test if cloud services are available
  async testConnection() {
    if (!this.isOnline) return false
    
    try {
      const response = await fetch(`${this.apiBaseUrl}/games?limit=1`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })
      
      this.cloudEnabled = response.ok
      return response.ok
    } catch (error) {
      console.warn('Cloud service unavailable:', error.message)
      this.cloudEnabled = false
      return false
    }
  }

  // Fetch all available games (local + cloud)
  async getAllGames() {
    const allGames = []
    
    // Always get local games first
    try {
      const localGames = await this.getLocalGames()
      allGames.push(...localGames)
    } catch (error) {
      console.warn('Failed to load local games:', error)
    }

    // Try to get cloud games if online
    if (this.isOnline && this.cloudEnabled) {
      try {
        const cloudGames = await this.getCloudGames()
        allGames.push(...cloudGames)
      } catch (error) {
        console.warn('Failed to load cloud games:', error)
      }
    }

    return this.deduplicateGames(allGames)
  }

  // Get local games (existing functionality)
  async getLocalGames() {
    try {
      const response = await fetch('./config/games-list.json')
      if (!response.ok) throw new Error('Failed to load local games list')
      
      const gamesList = await response.json()
      
      return gamesList.games.map(game => ({
        ...game,
        source: 'local',
        gameFolder: game.folder, // Map folder to gameFolder for consistency
        folder: game.folder, // Keep original folder property
        isLocal: true
      }))
    } catch (error) {
      console.error('Error loading local games:', error)
      return []
    }
  }

  // Get cloud games from Supabase
  async getCloudGames() {
    if (!this.isOnline || !this.cloudEnabled) return []

    try {
      const response = await fetch(`${this.apiBaseUrl}/games`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      const games = data.games || data // Handle different response formats

      return games.map(game => ({
        id: game.id,
        title: game.title,
        author: game.author,
        description: game.description,
        config: game.config,
        characters: game.characters,
        events: game.events,
        thumbnail: game.thumbnail_url,
        downloadCount: game.download_count || 0,
        rating: game.rating_average || 0,
        source: 'cloud',
        gameFolder: `cloud_${game.id}`,
        isLocal: false,
        cloudId: game.id,
        createdAt: game.created_at,
        updatedAt: game.updated_at
      }))
    } catch (error) {
      console.error('Error loading cloud games:', error)
      return []
    }
  }

  // Get specific game data (prioritize local, fallback to cloud)
  async getGameData(gameId, source = 'auto') {
    // Check cache first
    const cacheKey = `${source}_${gameId}`
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)
    }

    let gameData = null

    if (source === 'local' || source === 'auto') {
      try {
        gameData = await this.getLocalGameData(gameId)
        if (gameData) {
          this.cache.set(cacheKey, gameData)
          return gameData
        }
      } catch (error) {
        console.warn('Local game not found:', gameId)
      }
    }

    if ((source === 'cloud' || source === 'auto') && this.isOnline && this.cloudEnabled) {
      try {
        gameData = await this.getCloudGameData(gameId)
        if (gameData) {
          this.cache.set(cacheKey, gameData)
          return gameData
        }
      } catch (error) {
        console.warn('Cloud game not found:', gameId)
      }
    }

    throw new Error(`Game not found: ${gameId}`)
  }

  // Get local game data (existing folder structure)
  async getLocalGameData(gameFolder) {
    const basePath = `./gamefolder/${gameFolder}`
    
    try {
      const [config, characters, story] = await Promise.all([
        fetch(`${basePath}/config.json`).then(r => r.json()),
        fetch(`${basePath}/characters.json`).then(r => r.json()),
        fetch(`${basePath}/story.json`).then(r => r.json())
      ])

      return {
        config,
        characters: characters.characters || [],
        events: story.events || [],
        gameFolder,
        source: 'local'
      }
    } catch (error) {
      throw new Error(`Failed to load local game: ${gameFolder}`)
    }
  }

  // Get cloud game data from API
  async getCloudGameData(cloudId) {
    if (!this.isOnline || !this.cloudEnabled) {
      throw new Error('Cloud services unavailable')
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/games?gameId=${cloudId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const game = await response.json()

      return {
        config: game.config,
        characters: game.characters || {},
        events: game.events || {},
        gameFolder: `cloud_${game.id}`,
        source: 'cloud',
        cloudId: game.id
      }
    } catch (error) {
      throw new Error(`Failed to load cloud game: ${cloudId}`)
    }
  }

  // Upload game to cloud
  async uploadGameToCloud(gameData) {
    if (!this.isOnline || !this.cloudEnabled) {
      throw new Error('Cloud services unavailable')
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/games`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gameData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP ${response.status}`)
      }

      const result = await response.json()
      
      // Clear cache to force refresh
      this.cache.clear()
      
      return result.game
    } catch (error) {
      throw new Error(`Failed to upload game: ${error.message}`)
    }
  }

  // Record download for analytics
  async recordDownload(gameId, source = 'cloud') {
    if (source !== 'cloud' || !this.isOnline || !this.cloudEnabled) return

    try {
      await fetch(`${this.apiBaseUrl}/downloads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId })
      })
    } catch (error) {
      console.warn('Failed to record download:', error)
    }
  }

  // Remove duplicate games (prefer local over cloud)
  deduplicateGames(games) {
    const uniqueGames = new Map()
    
    // Process games, preferring local versions
    games.forEach(game => {
      const key = game.title.toLowerCase().trim()
      
      if (!uniqueGames.has(key) || game.source === 'local') {
        uniqueGames.set(key, game)
      }
    })
    
    return Array.from(uniqueGames.values())
  }

  // Search games (local + cloud)
  async searchGames(query) {
    const allGames = await this.getAllGames()
    const lowerQuery = query.toLowerCase()
    
    return allGames.filter(game => 
      game.title.toLowerCase().includes(lowerQuery) ||
      game.author.toLowerCase().includes(lowerQuery) ||
      (game.description && game.description.toLowerCase().includes(lowerQuery))
    )
  }

  // Get games by category/tag
  async getGamesByCategory(category) {
    const allGames = await this.getAllGames()
    
    return allGames.filter(game => {
      const tags = game.tags || []
      return tags.some(tag => tag.toLowerCase() === category.toLowerCase())
    })
  }

  // Clear cache
  clearCache() {
    this.cache.clear()
  }

  // Get cache stats
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }
}

// Export singleton instance
export const cloudGameManager = new CloudGameManager()