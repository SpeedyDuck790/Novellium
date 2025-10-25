-- Update Supabase Storage Bucket to Allow Image MIME Types
-- Run this in your Supabase SQL Editor

-- Update the game-assets bucket to allow all image types
UPDATE storage.buckets 
SET allowed_mime_types = ARRAY[
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/bmp',
  'image/tiff',
  'audio/mpeg',
  'audio/wav',
  'audio/ogg',
  'video/mp4',
  'video/webm',
  'application/json',
  'text/plain'
]
WHERE id = 'game-assets';

-- If the bucket doesn't exist, create it
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
SELECT 
  'game-assets', 
  'game-assets', 
  true, 
  52428800, -- 50MB limit
  ARRAY[
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/bmp',
    'image/tiff',
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'video/mp4',
    'video/webm',
    'application/json',
    'text/plain'
  ]
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'game-assets');