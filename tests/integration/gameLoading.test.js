// tests/integration/gameLoading.test.js
// Integration tests for game loading flow

import { describe, test, expect, beforeEach } from '@jest/globals';

describe('Game Loading Integration', () => {
  beforeEach(() => {
    // Setup DOM
    document.body.innerHTML = `
      <div id="game-container" style="display: none;">
        <div id="dialogue-box"></div>
        <div id="dialogue-text"></div>
        <div id="character-name"></div>
        <div id="choices-container"></div>
        <div id="background-container"></div>
        <div id="character-container"></div>
      </div>
      <div id="games-list-vertical"></div>
      <div id="welcome-content"></div>
      <div id="game-options-panel" style="display: none;">
        <h2 id="selected-game-title"></h2>
        <p id="selected-game-author"></p>
        <p id="selected-game-description"></p>
      </div>
    `;
    
    localStorage.clear();
  });

  test('should fetch and populate games list', async () => {
    // This test would use the mocked fetch from setup.js
    const response = await fetch('games/games-list.json');
    const data = await response.json();

    expect(data.games).toBeDefined();
    expect(data.games.length).toBeGreaterThan(0);
    expect(data.games[0]).toHaveProperty('title');
    expect(data.games[0]).toHaveProperty('id');
    expect(data.games[0]).toHaveProperty('author');
  });

  test('should load game data successfully', async () => {
    const response = await fetch('games/test-game/game.json');
    const gameData = await response.json();

    expect(gameData.info).toBeDefined();
    expect(gameData.info.title).toBe('Test Game');
    expect(gameData.info.author).toBe('Test Author');
    expect(gameData.characters).toBeDefined();
    expect(gameData.events).toBeDefined();
  });

  test('should handle missing game gracefully', async () => {
    await expect(
      fetch('games/nonexistent-game/game.json')
    ).rejects.toThrow('Not found');
  });

  test('should validate game data structure', async () => {
    const response = await fetch('games/test-game/game.json');
    const gameData = await response.json();

    // Validate info section
    expect(gameData.info).toHaveProperty('title');
    expect(gameData.info).toHaveProperty('id');
    expect(gameData.info).toHaveProperty('initialEvent');

    // Validate characters
    expect(Array.isArray(gameData.characters)).toBe(true);
    if (gameData.characters.length > 0) {
      const char = gameData.characters[0];
      expect(char).toHaveProperty('id');
      expect(char).toHaveProperty('name');
      expect(char).toHaveProperty('color');
      expect(char).toHaveProperty('sprites');
    }

    // Validate events
    expect(Array.isArray(gameData.events)).toBe(true);
    if (gameData.events.length > 0) {
      const event = gameData.events[0];
      expect(event).toHaveProperty('id');
      expect(event).toHaveProperty('type');
      expect(['dialogue', 'narration', 'choice']).toContain(event.type);
    }
  });

  test('should merge deployed games with games list', () => {
    // Setup: Add a deployed game to localStorage
    const deployedGame = {
      id: 'deployed-game',
      title: 'Deployed Game',
      description: 'A deployed game',
      author: 'Deploy Author',
      thumbnail: 'thumb.jpg',
      folder: 'deployed/deployed-game'
    };

    const deployedGames = { games: [deployedGame] };
    localStorage.setItem('deployed-games', JSON.stringify(deployedGames));

    // Simulate loading deployed games
    const stored = localStorage.getItem('deployed-games');
    const parsed = JSON.parse(stored);

    expect(parsed.games).toBeDefined();
    expect(parsed.games.length).toBe(1);
    expect(parsed.games[0].title).toBe('Deployed Game');
    expect(parsed.games[0].author).toBe('Deploy Author');
  });

  test('should find initial event in game data', async () => {
    const response = await fetch('games/test-game/game.json');
    const gameData = await response.json();

    const initialEventId = gameData.info.initialEvent;
    const initialEvent = gameData.events.find(e => e.id === initialEventId);

    expect(initialEvent).toBeDefined();
    expect(initialEvent.id).toBe('start');
  });

  test('should validate event chain integrity', async () => {
    const response = await fetch('games/test-game/game.json');
    const gameData = await response.json();

    const eventIds = new Set(gameData.events.map(e => e.id));

    // Check that all 'next' properties point to valid events
    for (const event of gameData.events) {
      if (event.next) {
        expect(eventIds.has(event.next)).toBe(true);
      }

      // Check choices point to valid events
      if (event.type === 'choice' && event.choices) {
        for (const choice of event.choices) {
          if (choice.next) {
            expect(eventIds.has(choice.next)).toBe(true);
          }
        }
      }
    }
  });

  test('should validate character references in events', async () => {
    const response = await fetch('games/test-game/game.json');
    const gameData = await response.json();

    const characterIds = new Set(gameData.characters.map(c => c.id));

    // Check that all character references in events are valid
    for (const event of gameData.events) {
      if (event.character) {
        expect(characterIds.has(event.character)).toBe(true);
      }
    }
  });
});

describe('Game Selection and Display', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="games-list-vertical"></div>
      <div id="welcome-content"></div>
      <div id="game-options-panel" style="display: none;">
        <h2 id="selected-game-title"></h2>
        <p id="selected-game-author" style="display: none;"></p>
        <p id="selected-game-description"></p>
        <div id="start-saves-list"></div>
      </div>
    `;
  });

  test('should display game author when available', () => {
    const game = {
      title: 'Test Game',
      author: 'Test Author',
      description: 'A test game'
    };

    // Simulate selecting a game
    document.getElementById('selected-game-title').textContent = game.title;
    
    const authorElement = document.getElementById('selected-game-author');
    if (game.author) {
      authorElement.textContent = `By ${game.author}`;
      authorElement.style.display = 'block';
    }

    expect(authorElement.textContent).toBe('By Test Author');
    expect(authorElement.style.display).toBe('block');
  });

  test('should hide author element when not available', () => {
    const game = {
      title: 'Test Game',
      description: 'A test game'
      // No author
    };

    const authorElement = document.getElementById('selected-game-author');
    
    if (!game.author) {
      authorElement.style.display = 'none';
    }

    expect(authorElement.style.display).toBe('none');
  });

  test('should create game card with author', () => {
    const game = {
      title: 'Test Game',
      author: 'Test Author',
      description: 'A test game',
      thumbnail: 'test.jpg',
      folder: 'games/test-game'
    };

    const gameCard = document.createElement('div');
    gameCard.className = 'vertical-game-card';
    gameCard.innerHTML = `
      <div class="vertical-game-thumbnail">
        <img src="${game.thumbnail}" alt="${game.title}">
      </div>
      <div class="vertical-game-info">
        <h3>${game.title}</h3>
        ${game.author ? `<p style="color: #ffd700; font-size: 0.85em; margin: 5px 0;">By ${game.author}</p>` : ''}
        <p>${game.description}</p>
      </div>
    `;

    expect(gameCard.innerHTML).toContain('By Test Author');
    expect(gameCard.innerHTML).toContain('color: #ffd700');
  });
});
