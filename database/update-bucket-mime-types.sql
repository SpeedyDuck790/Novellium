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
],
public = true
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

-- Fix RLS policies for storage uploads
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Authenticated users can upload game assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own assets" ON storage.objects;

-- Recreate permissive policies for anonymous uploads
CREATE POLICY "Anyone can upload game assets" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'game-assets');

CREATE POLICY "Anyone can update game assets" ON storage.objects  
  FOR UPDATE USING (bucket_id = 'game-assets')
  WITH CHECK (bucket_id = 'game-assets');

CREATE POLICY "Game assets are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'game-assets');