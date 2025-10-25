// API endpoint for game operations
// File: /api/games.js

import { gameManager } from '../src/config/supabase.js'

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    switch (req.method) {
      case 'GET':
        return await handleGetGames(req, res)
      case 'POST':
        return await handlePostGame(req, res)
      case 'PUT':
        return await handlePutGame(req, res)
      case 'DELETE':
        return await handleDeleteGame(req, res)
      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    })
  }
}

// GET /api/games - Fetch games
async function handleGetGames(req, res) {
  const { search, limit = 50, offset = 0, gameId } = req.query

  // Get specific game by ID
  if (gameId) {
    const game = await gameManager.getGame(gameId)
    if (!game) {
      return res.status(404).json({ error: 'Game not found' })
    }
    return res.status(200).json(game)
  }

  // Search or get all games
  let games
  if (search) {
    games = await gameManager.searchGames(search)
  } else {
    games = await gameManager.getPublicGames()
  }

  // Apply pagination
  const startIndex = parseInt(offset)
  const endIndex = startIndex + parseInt(limit)
  const paginatedGames = games.slice(startIndex, endIndex)

  return res.status(200).json({
    games: paginatedGames,
    total: games.length,
    offset: startIndex,
    limit: parseInt(limit)
  })
}

// POST /api/games - Upload new game
async function handlePostGame(req, res) {
  const {
    title,
    author,
    description,
    config,
    characters,
    events,
    isPublic = true
  } = req.body

  // Validate required fields
  if (!title || !author || !config || !characters || !events) {
    return res.status(400).json({
      error: 'Missing required fields',
      required: ['title', 'author', 'config', 'characters', 'events']
    })
  }

  // Validate data structure - characters and events should be objects, not arrays
  if (typeof characters !== 'object' || typeof events !== 'object') {
    return res.status(400).json({
      error: 'Characters and events must be objects (not arrays)',
      example: {
        characters: { "character_id": { name: "Name", color: "#color" } },
        events: { "event_id": { type: "dialogue", text: "Hello!" } }
      }
    })
  }

  if (typeof config !== 'object') {
    return res.status(400).json({
      error: 'Config must be an object'
    })
  }

  try {
    const gameData = {
      title: title.trim(),
      author: author.trim(),
      description: description?.trim() || '',
      config,
      characters,
      events,
      isPublic
    }

    const newGame = await gameManager.uploadGame(gameData)
    
    return res.status(201).json({
      success: true,
      game: newGame,
      message: 'Game uploaded successfully'
    })
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to upload game',
      message: error.message
    })
  }
}

// PUT /api/games - Update existing game
async function handlePutGame(req, res) {
  const { gameId } = req.query
  
  if (!gameId) {
    return res.status(400).json({ error: 'Game ID is required' })
  }

  // For now, return not implemented
  // You can implement game updates here if needed
  return res.status(501).json({ 
    error: 'Game updates not implemented yet' 
  })
}

// DELETE /api/games - Delete game
async function handleDeleteGame(req, res) {
  const { gameId } = req.query
  
  if (!gameId) {
    return res.status(400).json({ error: 'Game ID is required' })
  }

  // For now, return not implemented
  // You can implement game deletion here if needed
  return res.status(501).json({ 
    error: 'Game deletion not implemented yet' 
  })
}