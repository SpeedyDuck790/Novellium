# Novellium

A simple browser-based visual novel engine where you can create and play interactive stories.

## What is this?

Novellium lets you:
- **Create** visual novels using a simple web interface
- **Play** visual novels in your browser
- **Share** your stories as files

No downloads, no complex setup - just open it in your browser and start creating.

## Quick Start

1. **Start the server**:
   ```bash
   # Install http-server if you don't have it
   npm install -g http-server
   
   # Run the server
   http-server -p 8000 -c-1
   ```

2. **Open in browser**:
   - Go to `http://localhost:8000`
   - Click "Builder" to create stories
   - Click "Library" to play stories

## How to Create a Story

1. **Open the Builder** (`build.html`)
2. **Add your game info** - title, author, description
3. **Create characters** - give them names and colors
4. **Write events** - dialogue, choices, narration
5. **Deploy** - click "Deploy" to make it playable
6. **Test** - go back to the library and play your story

## How Stories Work

Stories are made of **events** that link together:

- **Dialogue**: Characters talking
- **Narration**: Story text without a character
- **Choices**: Let players make decisions
- **Scene**: Change backgrounds or music

Each event can link to the next one, creating your story flow.

## File Structure

```
Novellium/
├── index.html                          # Main library page (play games)
├── build.html                          # Game builder interface
├── styles.css                          # Global styles and themes
├── package.json                        # Project configuration
├── README.md                           # This documentation
│
├── src/                                # Core engine code
│   ├── engine.js                       # Main game engine
│   ├── models/                         # Data models
│   │   ├── Character.js                # Character class definition
│   │   ├── Event.js                    # Story event class
│   │   └── GameState.js                # Game state management
│   ├── managers/                       # System managers
│   │   ├── AssetLoader.js              # Load images/audio assets
│   │   ├── ConditionEvaluator.js       # Handle conditional logic
│   │   └── SaveManager.js              # Save/load game progress
│   └── ui/                             # User interface
│       └── Renderer.js                 # Display engine for scenes
│
├── config/                             # Configuration files
│   └── games-list.json                 # Registry of available games
│
├── scripts/                            # Utility scripts
│   ├── check-game-data.js              # Validate game data
│   └── navbar.html                     # Shared navigation component
│
├── gamefolder/                         # Game storage directory
│   ├── adventure-game/                 # Example adventure game
│   │   ├── config.json                 # Game metadata
│   │   ├── characters.json             # Character definitions
│   │   ├── story.json                  # Story events and flow
│   │   ├── backgrounds/                # Background images
│   │   └── sprites/                    # Character sprites
│   └── dating-game/                    # Example dating sim
│       ├── config.json                 # Game metadata
│       ├── characters.json             # Character definitions
│       ├── story.json                  # Story events and flow
│       ├── backgrounds/                # Background images
│       └── sprites/                    # Character sprites
│
├── NovelliumLogo/                      # Brand assets and icons
│   ├── logo.png                        # Main logo
│   ├── favicon.ico                     # Browser icon
│   ├── favicon.svg                     # Vector browser icon
│   ├── apple-touch-icon.png            # iOS home screen icon
│   ├── favicon-96x96.png               # High-res favicon
│   ├── web-app-manifest-192x192.png    # PWA icon (192x192)
│   ├── web-app-manifest-512x512.png    # PWA icon (512x512)
│   └── site.webmanifest                # PWA manifest
│
├── docs/                               # Documentation
│   └── README.pdf                      # PDF version of docs
│
└── .git/                               # Git repository data
```

## Features

**For Creators:**
- Visual editor with forms
- JSON editor for advanced users
- Asset upload (images, music)
- Export/import game files
- Live preview

**For Players:**
- Save/load games
- Customizable themes
- Typewriter text effects
- Choice-driven stories

## Tech Stuff

- **No dependencies** - pure HTML/CSS/JavaScript
- **Browser storage** - saves in localStorage
- **ES6 modules** - modern JavaScript
- **Canvas rendering** - for backgrounds
- **File exports** - share as ZIP files

## Need Help?

- Check the builder's help sections
- Look at example games in `gamefolder/`
- File issues on GitHub if something breaks

## License

Created by James Hill. Use it however you want.

---

**Simple. Clean. It just works.** 🎮