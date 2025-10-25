// API endpoint for download tracking and analytics
// File: /api/downloads.js

import { gameManager } from '../src/config/supabase.js'

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    switch (req.method) {
      case 'POST':
        return await handleRecordDownload(req, res)
      case 'GET':
        return await handleGetDownloadStats(req, res)
      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Download API Error:', error)
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    })
  }
}

// POST /api/downloads - Record a download
async function handleRecordDownload(req, res) {
  const { gameId } = req.body
  
  if (!gameId) {
    return res.status(400).json({ error: 'Game ID is required' })
  }

  try {
    // Use simplified schema - just increment download count
    const updatedCount = await gameManager.incrementDownloads(gameId)
    
    return res.status(200).json({
      success: true,
      downloads: updatedCount,
      message: 'Download recorded successfully'
    })
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to record download',
      message: error.message
    })
  }
}

// GET /api/downloads - Get download statistics  
async function handleGetDownloadStats(req, res) {
  const { gameId } = req.query

  try {
    if (gameId) {
      // Get stats for specific game
      const game = await gameManager.getGame(gameId)
      if (!game) {
        return res.status(404).json({ error: 'Game not found' })
      }

      return res.status(200).json({
        gameId,
        downloadCount: game.download_count || 0,
        title: game.title,
        author: game.author
      })
    } else {
      // Get top games by downloads
      const games = await gameManager.getPublicGames()
      const topGames = games
        .sort((a, b) => (b.download_count || 0) - (a.download_count || 0))
        .slice(0, 10)
        .map(game => ({
          id: game.id,
          title: game.title,
          author: game.author,
          download_count: game.download_count || 0
        }))

      return res.status(200).json({
        topGames,
        totalGames: games.length
      })
    }
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to get download stats',
      message: error.message
    })
  }
}