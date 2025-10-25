// API endpoint for asset uploads
// File: /api/upload.js

import { gameManager } from '../src/config/supabase.js'

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Limit file uploads to 10MB
    },
  },
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    return await handleAssetUpload(req, res)
  } catch (error) {
    console.error('Upload API Error:', error)
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    })
  }
}

async function handleAssetUpload(req, res) {
  const { gameId, assetType, assetName } = req.query
  
  // Validate required parameters
  if (!gameId || !assetType || !assetName) {
    return res.status(400).json({
      error: 'Missing required parameters',
      required: ['gameId', 'assetType', 'assetName']
    })
  }

  // Validate asset type
  const validAssetTypes = ['background', 'sprite', 'audio', 'music', 'thumbnail']
  if (!validAssetTypes.includes(assetType)) {
    return res.status(400).json({
      error: 'Invalid asset type',
      validTypes: validAssetTypes
    })
  }

  // Handle different content types
  let fileBuffer
  let mimeType
  
  if (req.headers['content-type']?.startsWith('multipart/form-data')) {
    // Handle multipart form data (typical file upload)
    // Note: For production, you'd want to use a proper multipart parser
    return res.status(400).json({
      error: 'Multipart uploads not implemented yet',
      message: 'Use base64 or binary upload instead'
    })
  } else if (req.headers['content-type']?.startsWith('application/json')) {
    // Handle base64 encoded files
    const { fileData, mimeType: clientMimeType } = req.body
    
    if (!fileData) {
      return res.status(400).json({ error: 'No file data provided' })
    }

    try {
      // Decode base64 data
      const base64Data = fileData.replace(/^data:[a-zA-Z0-9\/+;=]+,/, '')
      fileBuffer = Buffer.from(base64Data, 'base64')
      mimeType = clientMimeType || 'application/octet-stream'
    } catch (error) {
      return res.status(400).json({ 
        error: 'Invalid base64 data',
        message: error.message 
      })
    }
  } else {
    // Handle raw binary data
    fileBuffer = Buffer.from(req.body)
    mimeType = req.headers['content-type'] || 'application/octet-stream'
  }

  // Validate file size (10MB limit)
  if (fileBuffer.length > 10 * 1024 * 1024) {
    return res.status(413).json({
      error: 'File too large',
      maxSize: '10MB',
      actualSize: `${Math.round(fileBuffer.length / 1024 / 1024 * 100) / 100}MB`
    })
  }

  // Validate file type based on asset type
  const allowedMimeTypes = {
    background: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    sprite: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    thumbnail: ['image/jpeg', 'image/png', 'image/webp'],
    audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4'],
    music: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4']
  }

  if (!allowedMimeTypes[assetType]?.includes(mimeType)) {
    return res.status(400).json({
      error: 'Invalid file type for asset type',
      assetType,
      allowedTypes: allowedMimeTypes[assetType]
    })
  }

  try {
    // Create a File-like object for the upload
    const file = {
      size: fileBuffer.length,
      arrayBuffer: () => Promise.resolve(fileBuffer),
      stream: () => {
        const { Readable } = require('stream')
        return Readable.from(fileBuffer)
      }
    }

    // Upload to Supabase
    const assetData = await gameManager.uploadAsset(
      gameId, 
      file, 
      assetType, 
      assetName
    )

    return res.status(201).json({
      success: true,
      asset: assetData,
      message: 'Asset uploaded successfully'
    })
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to upload asset',
      message: error.message
    })
  }
}