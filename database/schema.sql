-- Supabase Database Schema for Novellium
-- Run these commands in your Supabase SQL Editor

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create games table
CREATE TABLE IF NOT EXISTS games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  description TEXT,
  config JSONB NOT NULL DEFAULT '{}',
  characters JSONB NOT NULL DEFAULT '[]',
  events JSONB NOT NULL DEFAULT '[]',
  thumbnail_url TEXT,
  is_public BOOLEAN DEFAULT true,
  download_count INTEGER DEFAULT 0,
  rating_average DECIMAL(3,2) DEFAULT 0.00,
  rating_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Add constraints
  CONSTRAINT games_title_length CHECK (char_length(title) >= 1 AND char_length(title) <= 100),
  CONSTRAINT games_author_length CHECK (char_length(author) >= 1 AND char_length(author) <= 50),
  CONSTRAINT games_rating_range CHECK (rating_average >= 0 AND rating_average <= 5)
);

-- Create game assets table
CREATE TABLE IF NOT EXISTS game_assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  asset_type TEXT NOT NULL, -- 'background', 'sprite', 'audio', 'music'
  asset_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  -- Add constraints
  CONSTRAINT game_assets_type_check CHECK (asset_type IN ('background', 'sprite', 'audio', 'music', 'thumbnail')),
  CONSTRAINT game_assets_name_length CHECK (char_length(asset_name) >= 1 AND char_length(asset_name) <= 100),
  
  -- Unique constraint to prevent duplicate assets per game
  UNIQUE(game_id, asset_type, asset_name)
);

-- Create game downloads table (for analytics)
CREATE TABLE IF NOT EXISTS game_downloads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  user_ip INET,
  user_agent TEXT
);

-- Create game ratings table
CREATE TABLE IF NOT EXISTS game_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  -- Prevent multiple ratings from same user
  UNIQUE(game_id, user_id)
);

-- Create game tags table
CREATE TABLE IF NOT EXISTS game_tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#6b7280',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  CONSTRAINT game_tags_name_length CHECK (char_length(name) >= 2 AND char_length(name) <= 20)
);

-- Create game_tag_relations table (many-to-many)
CREATE TABLE IF NOT EXISTS game_tag_relations (
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES game_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (game_id, tag_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_games_public ON games(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_games_created_at ON games(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_games_author ON games(author);
CREATE INDEX IF NOT EXISTS idx_games_title ON games(title);
CREATE INDEX IF NOT EXISTS idx_games_download_count ON games(download_count DESC);
CREATE INDEX IF NOT EXISTS idx_games_rating ON games(rating_average DESC);

CREATE INDEX IF NOT EXISTS idx_game_assets_game_id ON game_assets(game_id);
CREATE INDEX IF NOT EXISTS idx_game_assets_type ON game_assets(asset_type);

CREATE INDEX IF NOT EXISTS idx_game_downloads_game_id ON game_downloads(game_id);
CREATE INDEX IF NOT EXISTS idx_game_downloads_date ON game_downloads(downloaded_at DESC);

CREATE INDEX IF NOT EXISTS idx_game_ratings_game_id ON game_ratings(game_id);

-- Create storage buckets (run in Supabase dashboard)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('game-assets', 'game-assets', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('game-thumbnails', 'game-thumbnails', true);

-- Set up Row Level Security (RLS) policies

-- Games table policies
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read public games
CREATE POLICY "Public games are viewable by everyone" ON games
  FOR SELECT USING (is_public = true);

-- Allow authenticated users to insert games
CREATE POLICY "Authenticated users can insert games" ON games
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow users to update their own games
CREATE POLICY "Users can update their own games" ON games
  FOR UPDATE USING (auth.uid() = created_by);

-- Allow users to delete their own games
CREATE POLICY "Users can delete their own games" ON games
  FOR DELETE USING (auth.uid() = created_by);

-- Game assets table policies
ALTER TABLE game_assets ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read assets for public games
CREATE POLICY "Assets for public games are viewable by everyone" ON game_assets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM games 
      WHERE games.id = game_assets.game_id 
      AND games.is_public = true
    )
  );

-- Allow game owners to insert assets
CREATE POLICY "Game owners can insert assets" ON game_assets
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM games 
      WHERE games.id = game_assets.game_id 
      AND games.created_by = auth.uid()
    )
  );

-- Game downloads policies
ALTER TABLE game_downloads ENABLE ROW LEVEL SECURITY;

-- Allow everyone to insert download records
CREATE POLICY "Anyone can record downloads" ON game_downloads
  FOR INSERT WITH CHECK (true);

-- Game ratings policies
ALTER TABLE game_ratings ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read ratings
CREATE POLICY "Ratings are viewable by everyone" ON game_ratings
  FOR SELECT USING (true);

-- Allow authenticated users to insert ratings
CREATE POLICY "Authenticated users can rate games" ON game_ratings
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow users to update their own ratings
CREATE POLICY "Users can update their own ratings" ON game_ratings
  FOR UPDATE USING (auth.uid() = user_id);

-- Storage policies for game assets bucket
CREATE POLICY "Game assets are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'game-assets');

CREATE POLICY "Authenticated users can upload game assets" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'game-assets' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own assets" ON storage.objects
  FOR UPDATE USING (bucket_id = 'game-assets' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own assets" ON storage.objects
  FOR DELETE USING (bucket_id = 'game-assets' AND auth.role() = 'authenticated');

-- Functions for computed fields and triggers

-- Function to update game rating average
CREATE OR REPLACE FUNCTION update_game_rating_average()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE games 
  SET 
    rating_average = (
      SELECT COALESCE(AVG(rating), 0)::DECIMAL(3,2) 
      FROM game_ratings 
      WHERE game_id = COALESCE(NEW.game_id, OLD.game_id)
    ),
    rating_count = (
      SELECT COUNT(*) 
      FROM game_ratings 
      WHERE game_id = COALESCE(NEW.game_id, OLD.game_id)
    )
  WHERE id = COALESCE(NEW.game_id, OLD.game_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update rating average when ratings change
CREATE TRIGGER trigger_update_game_rating_average
  AFTER INSERT OR UPDATE OR DELETE ON game_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_game_rating_average();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at fields
CREATE TRIGGER trigger_update_games_updated_at
  BEFORE UPDATE ON games
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_game_ratings_updated_at
  BEFORE UPDATE ON game_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to increment download count
CREATE OR REPLACE FUNCTION increment_downloads(game_id UUID)
RETURNS INTEGER AS $$
DECLARE
  new_count INTEGER;
BEGIN
  UPDATE games 
  SET download_count = download_count + 1 
  WHERE id = game_id
  RETURNING download_count INTO new_count;
  
  RETURN new_count;
END;
$$ LANGUAGE plpgsql;

-- Insert some default tags
INSERT INTO game_tags (name, color) VALUES 
  ('Romance', '#f43f5e'),
  ('Adventure', '#10b981'),
  ('Comedy', '#f59e0b'),
  ('Drama', '#6366f1'),
  ('Fantasy', '#8b5cf6'),
  ('Sci-Fi', '#06b6d4'),
  ('Horror', '#ef4444'),
  ('Mystery', '#64748b'),
  ('Slice of Life', '#84cc16'),
  ('Historical', '#a3a3a3')
ON CONFLICT (name) DO NOTHING;

-- Create a view for easier game querying with aggregated data
CREATE OR REPLACE VIEW games_with_stats AS
SELECT 
  g.*,
  COALESCE(asset_count.count, 0) as asset_count,
  COALESCE(download_count_today.count, 0) as downloads_today,
  ARRAY_AGG(gt.name) FILTER (WHERE gt.name IS NOT NULL) as tags
FROM games g
LEFT JOIN (
  SELECT game_id, COUNT(*) as count
  FROM game_assets
  GROUP BY game_id
) asset_count ON g.id = asset_count.game_id
LEFT JOIN (
  SELECT game_id, COUNT(*) as count
  FROM game_downloads
  WHERE downloaded_at >= CURRENT_DATE
  GROUP BY game_id
) download_count_today ON g.id = download_count_today.game_id
LEFT JOIN game_tag_relations gtr ON g.id = gtr.game_id
LEFT JOIN game_tags gt ON gtr.tag_id = gt.id
GROUP BY g.id, asset_count.count, download_count_today.count;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;