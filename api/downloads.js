// API endpoint for download tracking and analytics
// File: /api/downloads.js

import { supabase, TABLES } from '../src/config/supabase.js'

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
    // Get client IP and user agent
    const clientIP = req.headers['x-forwarded-for'] || 
                    req.headers['x-real-ip'] || 
                    req.connection?.remoteAddress || 
                    req.socket?.remoteAddress || 
                    'unknown'
    
    const userAgent = req.headers['user-agent'] || 'unknown'

    // Record the download
    const { error: downloadError } = await supabase
      .from(TABLES.GAME_DOWNLOADS)
      .insert([{
        game_id: gameId,
        user_ip: clientIP,
        user_agent: userAgent
      }])

    if (downloadError) {
      console.error('Error recording download:', downloadError)
    }

    // Increment the game's download counter
    const { data, error } = await supabase
      .rpc('increment_downloads', { game_id: gameId })

    if (error) {
      console.error('Error incrementing download count:', error)
      return res.status(500).json({ 
        error: 'Failed to update download count',
        message: error.message 
      })
    }

    return res.status(200).json({
      success: true,
      newDownloadCount: data,
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
  const { gameId, period = '7d' } = req.query

  try {
    let dateFilter = "downloaded_at >= NOW() - INTERVAL '7 days'"
    
    switch (period) {
      case '1d':
        dateFilter = "downloaded_at >= NOW() - INTERVAL '1 day'"
        break
      case '7d':
        dateFilter = "downloaded_at >= NOW() - INTERVAL '7 days'"
        break
      case '30d':
        dateFilter = "downloaded_at >= NOW() - INTERVAL '30 days'"
        break
      case 'all':
        dateFilter = "TRUE" // No date filter
        break
      default:
        dateFilter = "downloaded_at >= NOW() - INTERVAL '7 days'"
    }

    if (gameId) {
      // Get stats for specific game
      const { data, error } = await supabase
        .from(TABLES.GAME_DOWNLOADS)
        .select('downloaded_at')
        .eq('game_id', gameId)
        .gte('downloaded_at', 
          period === 'all' ? '1970-01-01' : 
          period === '1d' ? new Date(Date.now() - 24*60*60*1000).toISOString() :
          period === '7d' ? new Date(Date.now() - 7*24*60*60*1000).toISOString() :
          period === '30d' ? new Date(Date.now() - 30*24*60*60*1000).toISOString() :
          new Date(Date.now() - 7*24*60*60*1000).toISOString()
        )

      if (error) throw error

      return res.status(200).json({
        gameId,
        period,
        downloadCount: data.length,
        downloads: data
      })
    } else {
      // Get overall stats
      const { data, error } = await supabase
        .from('games_with_stats')
        .select('id, title, author, download_count, downloads_today')
        .order('download_count', { ascending: false })
        .limit(20)

      if (error) throw error

      return res.status(200).json({
        period,
        topGames: data,
        totalGames: data.length
      })
    }
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to get download stats',
      message: error.message
    })
  }
}