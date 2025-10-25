// Mock Supabase for local testing
// This simulates what the cloud integration would return

export const mockCloudGames = [
  {
    id: 'cloud-game-1',
    title: 'Cloud Test Romance',
    author: 'Cloud User',
    description: 'A romantic story uploaded to the cloud by another user.',
    config: {
      title: 'Cloud Test Romance',
      author: 'Cloud User',
      startEvent: 'start'
    },
    characters: {
      'girl': {
        name: 'Sakura',
        color: '#ff69b4'
      },
      'boy': {
        name: 'Hiro',
        color: '#4169e1'
      }
    },
    events: {
      'start': {
        type: 'dialogue',
        character: 'girl',
        text: 'Welcome to this cloud-hosted visual novel!',
        next: 'choice1'
      },
      'choice1': {
        type: 'choice',
        text: 'What would you like to do?',
        choices: [
          { text: 'Learn about cloud features', next: 'cloud_info' },
          { text: 'Continue the story', next: 'story_continue' }
        ]
      },
      'cloud_info': {
        type: 'narration',
        text: 'This game was uploaded to Supabase cloud storage and is being served to all users globally!',
        next: 'story_continue'
      },
      'story_continue': {
        type: 'dialogue',
        character: 'boy',
        text: 'This demonstrates how users can create games and share them with everyone instantly.',
        next: 'end'
      },
      'end': {
        type: 'narration',
        text: 'Game complete! This was loaded from the cloud database.',
        next: null
      }
    },
    thumbnail_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZGllbnQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojMDBkNGZmO3N0b3Atb3BhY2l0eToxIiAvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMwMDk5ZmY7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogIDwvZGVmcz4KICA8cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0idXJsKCNncmFkaWVudCkiLz4KICA8dGV4dCB4PSIxNTAiIHk9IjgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7imYE8L3RleHQ+CiAgPHRleHQgeD0iMTUwIiB5PSIxMjAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkNsb3VkIEdhbWU8L3RleHQ+CiAgPHRleHQgeD0iMTUwIiB5PSIxNTAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkZyb20gU3VwYWJhc2U8L3RleHQ+Cjwvc3ZnPg==',
    download_count: 15,
    rating_average: 4.2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    source: 'cloud',
    isLocal: false,
    cloudId: 'cloud-game-1'
  },
  {
    id: 'cloud-game-2',
    title: 'Space Adventure Online',
    author: 'StarWriter',
    description: 'An epic space adventure shared from the cloud.',
    config: {
      title: 'Space Adventure Online',
      author: 'StarWriter',
      startEvent: 'start'
    },
    characters: {
      'captain': {
        name: 'Captain Nova',
        color: '#00ff88'
      }
    },
    events: {
      'start': {
        type: 'dialogue',
        character: 'captain',
        text: 'Welcome aboard the starship! This game was uploaded to the cloud by another player.',
        next: 'end'
      },
      'end': {
        type: 'narration',
        text: 'To be continued... (This was a cloud-hosted demo)',
        next: null
      }
    },
    thumbnail_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0ic3BhY2UiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojMjEyYTNlO3N0b3Atb3BhY2l0eToxIiAvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMwZjE3MmE7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogIDwvZGVmcz4KICA8cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0idXJsKCNzcGFjZSkiLz4KICA8Y2lyY2xlIGN4PSI3NSIgY3k9IjUwIiByPSIyIiBmaWxsPSJ3aGl0ZSIvPgogIDxjaXJjbGUgY3g9IjE1MCIgY3k9IjMwIiByPSIxIiBmaWxsPSJ3aGl0ZSIvPgogIDxjaXJjbGUgY3g9IjIyNSIgY3k9IjcwIiByPSIxLjUiIGZpbGw9IndoaXRlIi8+CiAgPHRleHQgeD0iMTUwIiB5PSIxMjAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzAwZmY4OCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+U3BhY2UgQWR2ZW50dXJlPC90ZXh0PgogIDx0ZXh0IHg9IjE1MCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiNjY2MiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkNsb3VkIEdhbWU8L3RleHQ+Cjwvc3ZnPg==',
    download_count: 8,
    rating_average: 3.8,
    created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    updated_at: new Date(Date.now() - 86400000).toISOString(),
    source: 'cloud',
    isLocal: false,
    cloudId: 'cloud-game-2'
  }
];

// Mock the CloudGameManager for local testing
export class MockCloudGameManager {
  constructor() {
    this.isOnline = true;
    this.cloudEnabled = false; // Start disabled to simulate no Supabase
  }

  async testConnection() {
    // Simulate connection test
    console.log('🧪 Mock: Testing cloud connection...');
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    
    // For demo purposes, let's say connection fails (no Supabase setup)
    this.cloudEnabled = false;
    return false;
  }

  async getAllGames() {
    console.log('🧪 Mock: Loading all games...');
    
    // Always get local games
    const localGames = await this.getLocalGames();
    let allGames = [...localGames];
    
    // Add mock cloud games if "cloud" is enabled (for demo)
    if (window.DEMO_CLOUD_MODE) {
      console.log('🧪 Mock: Adding demo cloud games...');
      const cloudGames = mockCloudGames.map(game => ({
        ...game,
        gameFolder: `cloud_${game.id}`,
        source: 'cloud'
      }));
      allGames = [...allGames, ...cloudGames];
    }
    
    return allGames;
  }

  async getLocalGames() {
    try {
      const response = await fetch('./config/games-list.json');
      const gamesList = await response.json();
      
      return gamesList.games.map(game => ({
        ...game,
        source: 'local',
        isLocal: true
      }));
    } catch (error) {
      console.error('Error loading local games:', error);
      return [];
    }
  }

  async uploadGameToCloud(gameData) {
    console.log('🧪 Mock: Simulating cloud upload...');
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate upload time
    
    if (!this.cloudEnabled) {
      throw new Error('Cloud services unavailable - set up Supabase first');
    }
    
    // Simulate successful upload
    return {
      id: `mock-${Date.now()}`,
      ...gameData,
      created_at: new Date().toISOString()
    };
  }

  async getGameData(gameId, source) {
    if (source === 'cloud' || gameId.startsWith('cloud_')) {
      const cloudId = gameId.replace('cloud_', '');
      const game = mockCloudGames.find(g => g.id === cloudId);
      
      if (game) {
        return {
          config: game.config,
          characters: game.characters,
          events: game.events,
          gameFolder: `cloud_${game.id}`,
          source: 'cloud',
          cloudId: game.id
        };
      }
    }
    
    // Fallback to local games
    throw new Error(`Mock: Game ${gameId} not found`);
  }

  async recordDownload(gameId, source) {
    console.log(`🧪 Mock: Recording download for ${gameId} (${source})`);
  }
}

// Global demo controls
window.DEMO_CLOUD_MODE = false;

window.enableDemoCloudMode = function() {
  window.DEMO_CLOUD_MODE = true;
  console.log('🧪 Demo cloud mode enabled - mock cloud games will appear');
  // Reload the page to show cloud games
  if (confirm('Enable demo cloud mode? This will reload the page to show mock cloud games.')) {
    window.location.reload();
  }
};

window.disableDemoCloudMode = function() {
  window.DEMO_CLOUD_MODE = false;
  console.log('🧪 Demo cloud mode disabled');
  if (confirm('Disable demo cloud mode? This will reload the page.')) {
    window.location.reload();
  }
};