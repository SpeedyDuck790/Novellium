import { Character } from './models/Character.js';
import { Event } from './models/Event.js';
import { GameState } from './models/GameState.js';
import { AssetLoader } from './managers/AssetLoader.js';
import { SaveManager } from './managers/SaveManager.js';
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
      
      // Start game
      this.gameState.setCurrentEvent(this.config.startEvent);
      await this.renderCurrentEvent();
      
    } catch (error) {
      this.renderer.showError(`Failed to load game: ${error.message}`);
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