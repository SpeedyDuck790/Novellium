// tests/setup.js
// Global test setup - runs before all tests

// Mock localStorage
global.localStorage = (() => {
  let store = {};

  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    }
  };
})();

// Mock IndexedDB (simplified version)
global.indexedDB = {
  open: jest.fn(() => {
    return {
      onsuccess: null,
      onerror: null,
      onupgradeneeded: null,
      result: {
        objectStoreNames: {
          contains: jest.fn(() => false)
        },
        createObjectStore: jest.fn(() => ({
          createIndex: jest.fn()
        })),
        transaction: jest.fn(() => ({
          objectStore: jest.fn(() => ({
            get: jest.fn(),
            put: jest.fn(),
            add: jest.fn(),
            delete: jest.fn(),
            getAll: jest.fn()
          }))
        }))
      }
    };
  })
};

// Mock fetch for loading game data
global.fetch = jest.fn((url) => {
  console.log('Mock fetch called with:', url);
  
  // Mock games-list.json
  if (url.includes('games-list.json')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        games: [
          {
            id: 'test-game',
            title: 'Test Game',
            description: 'A test game',
            author: 'Test Author',
            thumbnail: 'test.jpg',
            folder: 'games/test-game'
          }
        ]
      })
    });
  }
  
  // Mock game.json
  if (url.includes('game.json')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        info: {
          title: 'Test Game',
          id: 'test-game',
          author: 'Test Author',
          initialEvent: 'start'
        },
        characters: [
          {
            id: 'narrator',
            name: 'Narrator',
            color: '#ffffff',
            sprites: { default: 'narrator.png' }
          }
        ],
        events: [
          {
            type: 'dialogue',
            id: 'start',
            character: 'narrator',
            text: 'Welcome to the test game!',
            next: 'end'
          },
          {
            type: 'narration',
            id: 'end',
            text: 'The end.'
          }
        ]
      })
    });
  }
  
  return Promise.reject(new Error('Not found'));
});

// Mock Audio
global.Audio = class {
  constructor() {
    this.src = '';
    this.volume = 1;
    this.loop = false;
    this.currentTime = 0;
  }
  
  play() {
    return Promise.resolve();
  }
  
  pause() {}
  
  load() {}
};

// Mock Image
global.Image = class {
  constructor() {
    this.src = '';
    this.onload = null;
    this.onerror = null;
  }
  
  set src(value) {
    this._src = value;
    setTimeout(() => {
      if (this.onload) this.onload();
    }, 0);
  }
  
  get src() {
    return this._src;
  }
};

// Suppress console warnings in tests (optional)
// global.console.warn = jest.fn();
// global.console.error = jest.fn();

console.log('Test environment setup complete');
