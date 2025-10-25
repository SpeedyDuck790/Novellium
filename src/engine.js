import { Character } from './models/Character.js';
import { Event } from './models/Event.js';
import { GameState } from './models/GameState.js';
import { AssetLoader } from './managers/AssetLoader.js';
import { SaveManager } from './managers/SaveManager.js';
import { cloudGameManager } from './managers/CloudGameManager.js';
import { Renderer } from './ui/Renderer.js';

export class VisualNovelEngine {
  constructor(containerElement) {
    this.renderer = new Renderer(containerElement);
    this.saveManager = new SaveManager();
    this.assetLoader = null;
    this.gameState = new GameState();
    
    this.characters = new Map();
    this.events = new Map();
    this.config = null;
    this.currentGameFolder = null;
  }

  async loadGame(folderPath) {
    try {
      this.currentGameFolder = folderPath;
      
      // Check if this is a cloud game
      if (folderPath.startsWith('cloud_')) {
        const cloudId = folderPath.replace('cloud_', '');
        await this.loadCloudGame(cloudId);
      }
      // Check if this is a deployed game from localStorage
      else if (folderPath.startsWith('deployed/')) {
        const gameId = folderPath.split('/')[1];
        await this.loadDeployedGame(gameId);
      }
      // Load local game
      else {
        await this.loadLocalGame(folderPath);
      }
      
      // Start game
      this.gameState.setCurrentEvent(this.config.startEvent);
      await this.renderCurrentEvent();
      
    } catch (error) {
      this.renderer.showError(`Failed to load game: ${error.message}`);
      console.error(error);
    }
  }

  async loadLocalGame(folderPath) {
    this.assetLoader = new AssetLoader(folderPath);
    
    // Load config
    this.config = await this.assetLoader.loadJSON('config.json');
    
    // Load characters
    const charactersData = await this.assetLoader.loadJSON(this.config.characters);
    for (const [id, data] of Object.entries(charactersData.characters)) {
      this.characters.set(id, new Character(id, data));
    }
    
    // Load story
    const storyData = await this.assetLoader.loadJSON(this.config.story);
    for (const [id, data] of Object.entries(storyData.events)) {
      this.events.set(id, new Event(id, data));
    }
      
    // Preload commonly used assets
    await this.preloadAssets();
      
    console.log('Local game loaded successfully');
  }

  async loadCloudGame(cloudId) {
    try {
      // Get game data from cloud
      const gameData = await cloudGameManager.getGameData(cloudId, 'cloud');
      
      // Record download for analytics
      await cloudGameManager.recordDownload(cloudId, 'cloud');
      
      // Set up config
      this.config = gameData.config;
      
      // Load characters
      for (const [id, data] of Object.entries(gameData.characters)) {
        this.characters.set(id, new Character(id, data));
      }
      
      // Load events
      for (const [id, data] of Object.entries(gameData.events)) {
        this.events.set(id, new Event(id, data));
      }

      // Create cloud asset loader that works with direct URLs in events/characters
      this.assetLoader = {
        async loadImage(imagePath) {
          // For cloud games, imagePath might be a direct URL or a filename
          return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error(`Failed to load image: ${imagePath}`));
            
            // If it's already a full URL (from Supabase Storage), use it directly
            if (imagePath.startsWith('http')) {
              img.src = imagePath;
            } else {
              // If it's just a filename, we can't resolve it for cloud games
              reject(new Error(`Cloud asset filename not resolvable: ${imagePath}`));
            }
          });
        },
        
        async loadAudio(audioPath) {
          return new Promise((resolve, reject) => {
            const audio = new Audio();
            audio.oncanplaythrough = () => resolve(audio);
            audio.onerror = () => reject(new Error(`Failed to load audio: ${audioPath}`));
            
            // If it's already a full URL (from Supabase Storage), use it directly
            if (audioPath.startsWith('http')) {
              audio.src = audioPath;
            } else {
              reject(new Error(`Cloud audio filename not resolvable: ${audioPath}`));
            }
          });
        },
        
        async loadJSON(filename) {
          // For cloud games, data is already loaded
          if (filename === 'config.json') return gameData.config;
          if (filename === 'characters.json') return { characters: gameData.characters };
          if (filename === 'events.json') return { events: gameData.events };
          throw new Error(`Cloud JSON not found: ${filename}`);
        }
      };
      
      console.log('Cloud game loaded successfully:', cloudId);
    } catch (error) {
      console.error('Error loading cloud game:', error);
      throw error;
    }
  }

  async loadDeployedGame(gameId) {
    try {
      console.log('Loading deployed game:', gameId);
      
      // Load game data from localStorage
      const gameDataStr = localStorage.getItem(`vn_deployed_game_${gameId}`);
      if (!gameDataStr) {
        throw new Error('Deployed game data not found');
      }
      
      const gameData = JSON.parse(gameDataStr);
      
      // Load assets data
      const assetsStr = localStorage.getItem(`vn_deployed_assets_${gameId}`);
      const assets = assetsStr ? JSON.parse(assetsStr) : {};
      
      // Set up config
      this.config = {
        ...gameData.config,
        startEvent: gameData.config.initialEvent,
        characters: 'characters.json',
        story: 'events.json'
      };
      
      // Create a custom asset loader for deployed games
      this.assetLoader = {
        folderPath: `deployed/${gameId}`,
        assets: assets,
        
        async loadJSON(filename) {
          // Return the already loaded data
          if (filename === 'config.json') return gameData.config;
          if (filename === 'characters.json') return { characters: gameData.characters };
          if (filename === 'events.json') return { events: gameData.events };
          return {};
        },
        
        getAssetPath(path) {
          // Return base64 data URL from stored assets
          return this.assets[path] || path;
        },
        
        async preloadImages(paths) {
          // Images are already available as base64, so just validate
          console.log('Preloading', paths.length, 'images from deployed assets');
          return Promise.resolve();
        }
      };
      
      // Load characters
      for (const [id, data] of Object.entries(gameData.characters)) {
        this.characters.set(id, new Character(id, data));
      }
      
      // Load events
      for (const [id, data] of Object.entries(gameData.events)) {
        this.events.set(id, new Event(id, data));
      }
      
      console.log('Deployed game loaded. Characters:', this.characters.size, 'Events:', this.events.size);
      
      // Start game
      this.gameState.setCurrentEvent(this.config.startEvent);
      await this.renderCurrentEvent();
      
    } catch (error) {
      this.renderer.showError(`Failed to load deployed game: ${error.message}`);
      console.error(error);
    }
  }

  async preloadAssets() {
    const imagePaths = [];
    
    // Collect all backgrounds
    this.events.forEach(event => {
      if (event.background) imagePaths.push(event.background);
    });
    
    // Collect all sprites
    this.characters.forEach(char => {
      imagePaths.push(...Object.values(char.sprites));
    });
    
    await this.assetLoader.preloadImages(imagePaths);
  }

  async renderCurrentEvent() {
    const eventId = this.gameState.currentEvent;
    const event = this.events.get(eventId);
    
    console.log('Rendering event:', eventId);
    
    if (!event) {
      console.error(`Event not found: ${eventId}`);
      this.renderer.showError(`Event not found: ${eventId}`);
      return;
    }

    // Check if event conditions are met
    if (!event.meetsConditions(this.gameState.flags)) {
      console.warn(`Event ${eventId} conditions not met, skipping...`);
      // Could auto-advance to next event or show error
      return;
    }

    // Get dialogue text based on current flags
    const dialogueText = event.getDialogueText(this.gameState.flags);
    event.dialogue = dialogueText; // Update for rendering
    
    console.log('Event dialogue:', dialogueText);

    // Load assets
    let backgroundImg = null;
    let characterImg = null;
    let character = null;

    if (event.background) {
      backgroundImg = await this.assetLoader.loadImage(event.background);
      console.log('Loaded background:', event.background);
    }

    if (event.character) {
      character = this.characters.get(event.character.id);
      if (character) {
        const spritePath = character.getSprite(event.character.sprite);
        characterImg = await this.assetLoader.loadImage(spritePath);
        console.log('Loaded character:', event.character.id, spritePath);
      }
    }

    // Render
    this.renderer.renderEvent(event, character, backgroundImg, characterImg);

    // Render choices
    const availableChoices = event.getAvailableChoices(this.gameState.flags);
    console.log('Available choices:', availableChoices.length);
    this.renderer.renderChoices(availableChoices, (choice) => this.onChoiceSelected(choice));
  }

  onChoiceSelected(choice) {
    // Apply flag changes
    if (choice.setFlags) {
      Object.entries(choice.setFlags).forEach(([key, value]) => {
        this.gameState.setFlag(key, value);
      });
    }

    // Move to next event
    this.gameState.setCurrentEvent(choice.nextEvent);
    this.renderCurrentEvent();
  }

  async saveGame(slotName = 'autosave') {
    await this.saveManager.save(slotName, this.gameState, this.currentGameFolder);
  }

  async loadSave(slotName = 'autosave') {
    const saveData = this.saveManager.load(slotName);
    if (saveData) {
      // If the save has a different game folder or game not loaded, load that game first
      if (saveData.gameFolder && (saveData.gameFolder !== this.currentGameFolder || !this.config)) {
        await this.loadGame(saveData.gameFolder);
      }
      
      // Ensure game is loaded before restoring state
      if (!this.config) {
        console.error('Cannot load save: Game not loaded');
        return false;
      }
      
      this.gameState.fromJSON(saveData);
      await this.renderCurrentEvent();
      return true;
    }
    return false;
  }

  restartGame() {
    this.gameState = new GameState();
    this.gameState.setCurrentEvent(this.config.startEvent);
    this.renderCurrentEvent();
  }
}