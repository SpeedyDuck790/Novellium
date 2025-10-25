# Novellium User Guide

**A comprehensive guide to creating and playing visual novel games with Novellium**

## Table of Contents
1. [Getting Started](#getting-started)
2. [Playing Games](#playing-games)
3. [Creating Games](#creating-games)
4. [Game Format Reference](#game-format-reference)
5. [Advanced Features](#advanced-features)
6. [Troubleshooting](#troubleshooting)
7. [Tips & Best Practices](#tips--best-practices)

---

## Getting Started

### What is Novellium?
Novellium is a web-based visual novel engine that lets you create and play interactive stories directly in your browser. No downloads or installations required!

### Accessing Novellium
- **Online**: Visit [novellium.vercel.app](https://novellium.vercel.app)
- **Local**: Download and run on your computer (see technical setup in README.md)

### First Time Setup
1. Open Novellium in your web browser
2. You'll see the main library with example games
3. Click any game to start playing immediately
4. Click "Create Game" to start building your own story

---

## Playing Games

### Game Library
The main screen shows all available games:
- **Local Games**: Stored in your browser
- **Cloud Games**: Shared by other users worldwide
- **Import Area**: Drag ZIP files here to add new games

### Game Controls
- **Click**: Advance dialogue and make choices
- **Save Button**: Save your progress at any time
- **Load Button**: Load a previous save
- **Menu Button**: Access game settings and return to library
- **Auto-Save**: Game automatically saves at key points

### Save System
- **Manual Saves**: Click "Save" to create a save point
- **Auto-Saves**: Created automatically at important moments
- **Export Saves**: Download your saves as files
- **Import Saves**: Upload save files from other devices

### Importing Games
1. **Drag & Drop**: Drag a ZIP file onto the library
2. **File Browser**: Click "Import Game" and select a ZIP file
3. **URL Import**: Paste a direct link to a game ZIP file

---

## Creating Games

### Opening the Builder
- Click "Create Game" from the main library
- Or visit `/build.html` directly
- The builder has three main sections: Game Info, Characters, and Events

### Game Information
Set up your game's basic details:
- **Title**: Your game's name (required)
- **Author**: Your name or handle (required)
- **Description**: Brief summary of your story
- **Start Event**: Which event begins your game (auto-set to first event)

### Creating Characters
Characters are the people in your story:

1. **Add Character**: Click the "+" button
2. **Name**: Character's display name
3. **Color**: Text color when they speak (click color box to change)
4. **Sprites**: Upload images for different emotions/poses
   - Drag images directly onto the sprite upload areas
   - Supported formats: PNG, JPG, GIF
   - Recommended size: 300-500px wide

### Building Your Story with Events
Events are the building blocks of your story:

#### Event Types
- **Dialogue**: Character speaking
- **Narration**: Story text without a character
- **Choice**: Present options to the player
- **Scene**: Change background or music

#### Creating an Event
1. Click "Add Event" 
2. Choose event type
3. Fill in the details:
   - **ID**: Unique identifier (auto-generated)
   - **Type**: Dialogue, Narration, Choice, or Scene
   - **Text**: What the player sees
   - **Character**: Who is speaking (for dialogue events)
   - **Background**: Background image for this event
   - **Sprite**: Character image to display
   - **Next Event**: Which event comes after this one

#### Connecting Events
- **Linear**: Each event leads to the next one
- **Branching**: Choice events can lead to different paths
- **Loops**: Events can reference earlier events
- **Endings**: Events with no "next" event end the game

### Choices and Branching
Create interactive stories with player choices:

1. **Create Choice Event**: Set type to "Choice"
2. **Add Choices**: Click "Add Choice" for each option
3. **Choice Text**: What the player sees
4. **Next Event**: Where this choice leads
5. **Conditions**: Advanced - only show choice if conditions are met

### Adding Assets
Enhance your story with images and audio:

#### Images
- **Backgrounds**: Scene backgrounds (recommended: 800x600px or larger)
- **Character Sprites**: Character images (recommended: 300-500px wide)
- **UI Elements**: Custom buttons or decorations

#### Audio (Coming Soon)
- **Background Music**: Looping music tracks
- **Sound Effects**: Button clicks, ambient sounds
- **Voice Acting**: Character voice clips

### Testing Your Game
1. **Deploy Local**: Test your game in the engine
2. **Preview**: See how events connect and flow
3. **Debug**: Check console for errors or missing assets
4. **Iterate**: Make changes and test again

### Publishing Your Game

#### Local Export
1. Click "Export Game"
2. Downloads a ZIP file containing your game
3. Share the ZIP file with others
4. Recipients can import it into their Novellium

#### Cloud Publishing ("Bottle in the Sea")
1. Click "Deploy Cloud" 
2. Game uploads to global library
3. Available to all Novellium users immediately
4. No account required - truly anonymous sharing

---

## Game Format Reference

### File Structure
When you export a game, it creates a ZIP file with this structure:
```
your-game.zip
├── config.json          # Game metadata
├── characters.json      # Character definitions  
├── story.json          # Events and story flow
└── assets/             # Images and audio
    ├── backgrounds/    # Background images
    ├── sprites/       # Character sprites
    └── audio/         # Sound files (future)
```

### JSON Format Examples

#### config.json
```json
{
  "title": "My Amazing Story",
  "author": "Your Name",
  "description": "A thrilling adventure...",
  "startEvent": "intro"
}
```

#### characters.json
```json
{
  "characters": {
    "alice": {
      "name": "Alice",
      "color": "#ff6b9d",
      "sprites": {
        "neutral": "sprites/alice_neutral.png",
        "happy": "sprites/alice_happy.png",
        "sad": "sprites/alice_sad.png"
      }
    }
  }
}
```

#### story.json
```json
{
  "events": {
    "intro": {
      "type": "dialogue",
      "character": "alice",
      "text": "Hello! Welcome to my story.",
      "background": "backgrounds/garden.jpg",
      "sprite": "neutral",
      "next": "choice1"
    },
    "choice1": {
      "type": "choice", 
      "text": "What do you say?",
      "choices": [
        {"text": "Hello Alice!", "next": "happy_path"},
        {"text": "I have to go.", "next": "sad_path"}
      ]
    }
  }
}
```

---

## Advanced Features

### Conditional Events
Show different content based on player choices:

```json
{
  "type": "dialogue",
  "text": "Thanks for helping me earlier!",
  "condition": "helped_alice == true",
  "character": "alice"
}
```

### Variables and State
Track player progress and choices:
- Variables automatically created from choice IDs
- Use in conditions to create dynamic stories
- Example: `if (romance_points > 5)` show special ending

### Custom Styling
Customize your game's appearance:
- Character colors affect dialogue text
- Background images set the scene mood
- Sprite expressions convey emotion

### Multiple Endings
Create replayable stories:
- Different choice paths lead to different endings
- Use conditions to lock/unlock content
- Encourage exploration and replaying

---

## Troubleshooting

### Common Issues

#### Game Won't Load
- **Check file format**: Must be ZIP file
- **Verify structure**: Must contain config.json, characters.json, story.json
- **Asset paths**: Make sure image paths in JSON match actual files

#### Images Not Showing
- **File formats**: Use PNG, JPG, or GIF only
- **File paths**: Check spelling and case sensitivity
- **File size**: Very large images may load slowly

#### Events Not Connecting
- **Event IDs**: Must be unique and match exactly
- **Next events**: Must reference existing event IDs
- **Start event**: Must be set in config.json

#### Builder Not Saving
- **Browser storage**: Make sure localStorage is enabled
- **File permissions**: Check browser console for errors
- **Memory**: Large games may hit browser storage limits

### Getting Help
- **Browser Console**: Press F12 to see error messages
- **Example Games**: Study the included sample games
- **Community**: Ask questions in GitHub Discussions
- **Bug Reports**: Submit issues on GitHub

---

## Tips & Best Practices

### Story Writing
- **Start Simple**: Begin with a linear story, add branching later
- **Clear Choices**: Make player options obviously different
- **Meaningful Consequences**: Choices should matter to the story
- **Test Flow**: Play through all possible paths

### Character Design
- **Consistent Style**: Keep character art in similar style
- **Clear Expressions**: Make emotions easy to read
- **Appropriate Colors**: Choose text colors that are readable

### Technical Tips
- **Organize Assets**: Use clear, descriptive filenames
- **Optimize Images**: Compress large images for faster loading
- **Test Early**: Deploy and test frequently while building
- **Backup Work**: Export your game regularly to save progress

### Publishing
- **Polished Experience**: Test thoroughly before sharing
- **Clear Description**: Help players understand what to expect
- **Appropriate Content**: Consider your audience
- **Credit Assets**: Acknowledge any borrowed images or music

### Community
- **Share and Discover**: Try games by other creators
- **Give Feedback**: Help improve the community
- **Learn from Others**: Study successful games for inspiration
- **Be Respectful**: Maintain a positive creative environment

---

## Resources

### Learning Materials
- **Example Games**: Study the included dating-game and adventure-game
- **JSON Tutorial**: Learn JSON syntax for advanced editing
- **Image Editing**: GIMP, Photoshop, or online tools for creating assets
- **Writing Guides**: General interactive fiction writing resources

### Asset Sources
- **Free Images**: Unsplash, Pixabay, Freepik (check licenses)
- **Character Art**: Commission artists or create your own
- **Backgrounds**: Photography or digital art
- **Audio**: Freesound, Zapsplat (for future audio features)

### Community
- **GitHub**: Report bugs, suggest features, contribute code
- **Discord**: Chat with other creators (link in repository)
- **Reddit**: Share your games in visual novel communities
- **Twitter**: Use #Novellium to share your creations

---

**Happy storytelling with Novellium!** 🎮✨

*Last updated: October 2025*