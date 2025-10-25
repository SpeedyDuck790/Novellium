-- Simplified Supabase Database Schema for Novellium
-- Run these commands in your Supabase SQL Editor

-- Note: JWT secret is automatically configured by Supabase
-- No need to manually set app.jwt_secret

-- CLEAR EXISTING DATABASE
-- WARNING: This will delete all existing data!
-- Remove these lines if you want to keep existing data

-- Drop existing tables if they exist (in reverse dependency order)
DROP TABLE IF EXISTS game_tag_relations CASCADE;
DROP TABLE IF EXISTS game_tags CASCADE;
DROP TABLE IF EXISTS game_ratings CASCADE;
DROP TABLE IF EXISTS game_downloads CASCADE;
DROP TABLE IF EXISTS game_assets CASCADE;
DROP TABLE IF EXISTS games CASCADE;

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS update_game_rating_average() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS increment_downloads(UUID) CASCADE;
DROP FUNCTION IF EXISTS increment_download_count(UUID) CASCADE;

-- Drop existing views if they exist
DROP VIEW IF EXISTS games_with_stats CASCADE;

-- Clear storage policies (if they exist)
DROP POLICY IF EXISTS "Game assets are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload game assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own assets" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload game assets" ON storage.objects;

-- END CLEAR SECTION

-- Create simple games table matching the builder's actual data structure
CREATE TABLE IF NOT EXISTS games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Basic game info (from project info form)
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  description TEXT,
  game_id TEXT NOT NULL UNIQUE, -- The folder/URL name (e.g., "my-game")
  
  -- Game data (exactly as exported by builder)
  config JSONB NOT NULL, -- { title, author, initialEvent }
  characters JSONB NOT NULL, -- { "character_id": { name, color, sprites } }
  events JSONB NOT NULL, -- { "event_id": { type, text, character, next, etc } }
  
  -- Optional metadata
  is_public BOOLEAN DEFAULT true,
  thumbnail_url TEXT,
  
  -- Simple analytics
  download_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  -- Simple constraints
  CONSTRAINT games_title_length CHECK (char_length(title) >= 1 AND char_length(title) <= 100),
  CONSTRAINT games_author_length CHECK (char_length(author) >= 1 AND char_length(author) <= 50),
  CONSTRAINT games_game_id_format CHECK (game_id ~ '^[a-z0-9-]+$')
);

-- Create simple storage bucket for game assets
-- INSERT INTO storage.buckets (id, name, public) VALUES ('game-assets', 'game-assets', true);

-- Simple indexes for performance
CREATE INDEX IF NOT EXISTS idx_games_public ON games(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_games_created_at ON games(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_games_author ON games(author);
CREATE INDEX IF NOT EXISTS idx_games_title ON games(title);
CREATE INDEX IF NOT EXISTS idx_games_game_id ON games(game_id);

-- Set up Row Level Security (RLS) policies
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read public games (no auth needed)
CREATE POLICY "Public games are viewable by everyone" ON games
  FOR SELECT USING (is_public = true);

-- Allow anyone to insert games (like throwing a bottle into the sea!)
CREATE POLICY "Anyone can upload games" ON games
  FOR INSERT WITH CHECK (true);

-- Simple function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at field
CREATE TRIGGER trigger_update_games_updated_at
  BEFORE UPDATE ON games
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Simple function to increment download count
CREATE OR REPLACE FUNCTION increment_download_count(target_game_id UUID)
RETURNS INTEGER AS $$
DECLARE
  new_count INTEGER;
BEGIN
  UPDATE games 
  SET download_count = download_count + 1 
  WHERE id = target_game_id
  RETURNING download_count INTO new_count;
  
  RETURN new_count;
END;
$$ LANGUAGE plpgsql;

-- Storage policies for game assets bucket
CREATE POLICY "Game assets are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'game-assets');

CREATE POLICY "Anyone can upload game assets" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'game-assets');

-- Grant permissions (no auth required)
GRANT USAGE ON SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon;