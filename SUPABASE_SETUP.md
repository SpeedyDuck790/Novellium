# Supabase Setup Guide for Novellium

## 🚀 Quick Setup Steps

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose organization and name your project
4. Set a strong database password
5. Select region closest to your users
6. Wait for project creation (2-3 minutes)

### 2. Set Up Database Schema
1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the entire contents of `database/schema.sql`
4. Click **Run** to execute all the SQL commands
5. Verify tables were created in **Table Editor**

### 3. Configure Storage
1. Go to **Storage** in Supabase dashboard
2. Create new bucket called `game-assets`
3. Set bucket to **Public**
4. Create another bucket called `game-thumbnails` (Public)
5. Configure storage policies (already included in schema)

### 4. Get API Keys
1. Go to **Settings → API**
2. Copy your **Project URL** 
3. Copy your **anon/public key**
4. Save these for environment variables

### 5. Deploy to Vercel
1. Push your code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```
4. Deploy!

## 🔧 Environment Variables

Add these to your Vercel project settings:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## 📝 Testing the Integration

### Test Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open browser and test:
# 1. Load local games (should work as before)
# 2. Check browser console for cloud connection status
# 3. Try uploading a game from the builder
```

### Test Cloud Features
1. **Upload Test Game**:
   - Open the Builder (`/build.html`)
   - Create a simple test game
   - Click "Deploy to Cloud" (you'll need to add this button)
   - Check Supabase dashboard for new game entry

2. **Load Cloud Game**:
   - Cloud games should appear in the library
   - Try playing a cloud game
   - Check that assets load from Supabase storage

3. **Analytics**:
   - Download counters should increment
   - Check `game_downloads` table in Supabase

## 📊 Database Structure

Your Supabase database will have these tables:

- **`games`** - Main game data (config, characters, events)
- **`game_assets`** - File references (images, audio)
- **`game_downloads`** - Download tracking for analytics
- **`game_ratings`** - User ratings and reviews
- **`game_tags`** - Category tags for games
- **`game_tag_relations`** - Many-to-many tag relationships

## 🔒 Security Features

- **Row Level Security (RLS)** enabled on all tables
- **Public games** readable by everyone
- **Asset uploads** require authentication (optional)
- **Game ownership** enforced for updates/deletes
- **File size limits** (10MB per asset)

## 🎮 How It Works

### Game Loading Flow
1. **Library loads** → Fetch local games + cloud games
2. **User clicks game** → Check if local or cloud
3. **Local games** → Load from `/gamefolder/`
4. **Cloud games** → Fetch from Supabase API
5. **Assets** → Load from respective sources

### Upload Flow
1. **Builder creates game** → Local development
2. **Deploy button** → Upload to Supabase
3. **Assets upload** → Store in Supabase Storage
4. **Game appears** → In cloud library for all users

## 🚨 Troubleshooting

### Common Issues

**"Supabase connection failed"**
- Check environment variables are set correctly
- Verify Supabase project is running
- Check network connectivity

**"Failed to upload game"**
- Verify authentication (if required)
- Check file size limits
- Validate game data structure

**"Assets not loading"**
- Check storage bucket is public
- Verify asset file paths in database
- Check CORS settings

### Debug Tools

Add to your browser console:
```javascript
// Test cloud connection
await cloudGameManager.testConnection()

// Check cache status
cloudGameManager.getCacheStats()

// View all games
await cloudGameManager.getAllGames()
```

## 📈 Scaling Considerations

### Free Tier Limits
- **Database**: 500MB storage
- **Storage**: 1GB file storage
- **Bandwidth**: 2GB/month
- **Requests**: 50,000/month

### Upgrade Path
- **Pro Plan**: $25/month
- **Higher limits** for production use
- **Better performance** and support

## 🔄 Migration Strategy

### Phase 1: Hybrid Mode (Recommended)
- Keep existing local games working
- Add cloud games as additional source
- Gradual user adoption

### Phase 2: Cloud-First
- Migrate popular local games to cloud
- Keep local fallback for offline use
- Enhanced features (ratings, search)

### Phase 3: Full Cloud
- All new games uploaded to cloud
- Local games for development only
- Advanced analytics and social features

---

## 🎯 Success Checklist

- [ ] Supabase project created
- [ ] Database schema deployed
- [ ] Storage buckets configured
- [ ] Environment variables set
- [ ] Vercel deployment working
- [ ] Local games still load
- [ ] Cloud games appear in library
- [ ] Upload functionality works
- [ ] Assets load from cloud
- [ ] Download tracking works

Your Novellium project now has **cloud-powered game sharing** while maintaining **local development** capabilities! 🎉