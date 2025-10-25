// tests/unit/SaveManager.test.js
// Example unit tests for SaveManager

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';

// Mock localStorage for testing
const localStorageMock = (() => {
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

global.localStorage = localStorageMock;

// SaveManager class implementation (adjust import path as needed)
// For testing purposes, you may need to refactor SaveManager into a proper module
class SaveManager {
  constructor(gameId, maxSlots = 10, maxBackups = 5) {
    this.gameId = gameId;
    this.maxSlots = maxSlots;
    this.maxBackups = maxBackups;
    this.storageKey = `vn-saves-${gameId}`;
  }

  createSave(gameData, slot = null, type = 'manual') {
    const saves = this.getAllSaves();
    
    // Find next available slot if not specified
    if (slot === null) {
      slot = type === 'auto' ? 0 : 1;
      while (saves.some(s => s.slot === slot)) {
        slot++;
      }
    }

    const save = {
      id: `save-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      gameId: this.gameId,
      gameData: gameData,
      timestamp: Date.now(),
      slot: slot,
      type: type,
      screenshot: null
    };

    saves.push(save);
    this.savesToStorage(saves);
    
    // Create backup
    if (type === 'manual') {
      this.createBackup(save);
    }

    return save;
  }

  loadSave(saveId) {
    const saves = this.getAllSaves();
    return saves.find(s => s.id === saveId);
  }

  getAllSaves() {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  deleteSave(saveId) {
    let saves = this.getAllSaves();
    saves = saves.filter(s => s.id !== saveId);
    this.savesToStorage(saves);
  }

  savesToStorage(saves) {
    localStorage.setItem(this.storageKey, JSON.stringify(saves));
  }

  exportSave(saveId) {
    const save = this.loadSave(saveId);
    if (!save) {
      throw new Error('Save not found');
    }
    return JSON.stringify(save, null, 2);
  }

  importSave(saveDataString) {
    const save = JSON.parse(saveDataString);
    
    // Validate save data
    if (!save.gameId || !save.gameData) {
      throw new Error('Invalid save data');
    }

    // Add to saves
    const saves = this.getAllSaves();
    saves.push(save);
    this.savesToStorage(saves);

    return save;
  }

  createBackup(save) {
    const backupKey = `vn-backups-${this.gameId}`;
    let backups = JSON.parse(localStorage.getItem(backupKey) || '[]');
    
    backups.push({
      ...save,
      backupTimestamp: Date.now()
    });

    // Keep only last N backups
    if (backups.length > this.maxBackups) {
      backups = backups.slice(-this.maxBackups);
    }

    localStorage.setItem(backupKey, JSON.stringify(backups));
  }

  getBackups() {
    const backupKey = `vn-backups-${this.gameId}`;
    return JSON.parse(localStorage.getItem(backupKey) || '[]');
  }
}

describe('SaveManager', () => {
  let saveManager;
  const gameId = 'test-game';

  beforeEach(() => {
    localStorage.clear();
    saveManager = new SaveManager(gameId);
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('createSave', () => {
    test('should create a new save with valid data', () => {
      const gameData = {
        currentEventId: 'chapter1',
        variables: { score: 10 },
        characterStates: {}
      };

      const save = saveManager.createSave(gameData, 1, 'manual');

      expect(save).toBeDefined();
      expect(save.id).toBeTruthy();
      expect(save.gameId).toBe(gameId);
      expect(save.gameData).toEqual(gameData);
      expect(save.type).toBe('manual');
      expect(save.slot).toBe(1);
      expect(save.timestamp).toBeTruthy();
    });

    test('should auto-assign slot when not specified', () => {
      const gameData = { currentEventId: 'start' };

      const save1 = saveManager.createSave(gameData, null, 'auto');
      const save2 = saveManager.createSave(gameData, null, 'auto');

      expect(save1.slot).toBe(0);
      expect(save2.slot).toBe(1);
    });

    test('should create backup for manual saves', () => {
      const gameData = { currentEventId: 'chapter1' };

      saveManager.createSave(gameData, 1, 'manual');
      const backups = saveManager.getBackups();

      expect(backups.length).toBe(1);
      expect(backups[0].gameData).toEqual(gameData);
    });

    test('should not create backup for auto saves', () => {
      const gameData = { currentEventId: 'chapter1' };

      saveManager.createSave(gameData, 0, 'auto');
      const backups = saveManager.getBackups();

      expect(backups.length).toBe(0);
    });
  });

  describe('loadSave', () => {
    test('should load an existing save by ID', () => {
      const gameData = { currentEventId: 'chapter1' };
      const save = saveManager.createSave(gameData, 1, 'manual');

      const loaded = saveManager.loadSave(save.id);

      expect(loaded).toEqual(save);
    });

    test('should return undefined for non-existent save', () => {
      const loaded = saveManager.loadSave('non-existent-id');

      expect(loaded).toBeUndefined();
    });
  });

  describe('getAllSaves', () => {
    test('should return empty array when no saves exist', () => {
      const saves = saveManager.getAllSaves();

      expect(saves).toEqual([]);
    });

    test('should return all saves for the game', () => {
      const gameData1 = { currentEventId: 'chapter1' };
      const gameData2 = { currentEventId: 'chapter2' };

      saveManager.createSave(gameData1, 1, 'manual');
      saveManager.createSave(gameData2, 2, 'manual');

      const saves = saveManager.getAllSaves();

      expect(saves.length).toBe(2);
    });
  });

  describe('deleteSave', () => {
    test('should delete a save by ID', () => {
      const gameData = { currentEventId: 'chapter1' };
      const save = saveManager.createSave(gameData, 1, 'manual');

      saveManager.deleteSave(save.id);
      const loaded = saveManager.loadSave(save.id);

      expect(loaded).toBeUndefined();
    });

    test('should not affect other saves', () => {
      const save1 = saveManager.createSave({ currentEventId: 'ch1' }, 1, 'manual');
      const save2 = saveManager.createSave({ currentEventId: 'ch2' }, 2, 'manual');

      saveManager.deleteSave(save1.id);
      const remaining = saveManager.getAllSaves();

      expect(remaining.length).toBe(1);
      expect(remaining[0].id).toBe(save2.id);
    });
  });

  describe('exportSave', () => {
    test('should export save as JSON string', () => {
      const gameData = { currentEventId: 'chapter1' };
      const save = saveManager.createSave(gameData, 1, 'manual');

      const exported = saveManager.exportSave(save.id);

      expect(typeof exported).toBe('string');
      expect(JSON.parse(exported)).toEqual(save);
    });

    test('should throw error for non-existent save', () => {
      expect(() => {
        saveManager.exportSave('non-existent-id');
      }).toThrow('Save not found');
    });
  });

  describe('importSave', () => {
    test('should import a valid save', () => {
      const save = {
        id: 'imported-save',
        gameId: gameId,
        gameData: { currentEventId: 'chapter1' },
        timestamp: Date.now(),
        slot: 5,
        type: 'manual'
      };

      const imported = saveManager.importSave(JSON.stringify(save));

      expect(imported).toEqual(save);
      
      const loaded = saveManager.loadSave(save.id);
      expect(loaded).toEqual(save);
    });

    test('should throw error for invalid save data', () => {
      const invalidSave = JSON.stringify({ invalidField: 'data' });

      expect(() => {
        saveManager.importSave(invalidSave);
      }).toThrow('Invalid save data');
    });

    test('should throw error for malformed JSON', () => {
      expect(() => {
        saveManager.importSave('not valid json');
      }).toThrow();
    });
  });

  describe('backups', () => {
    test('should maintain maximum number of backups', () => {
      const maxBackups = 3;
      const sm = new SaveManager(gameId, 10, maxBackups);

      // Create more saves than max backups
      for (let i = 0; i < 5; i++) {
        sm.createSave({ currentEventId: `ch${i}` }, i + 1, 'manual');
      }

      const backups = sm.getBackups();

      expect(backups.length).toBe(maxBackups);
    });

    test('should keep most recent backups', () => {
      const maxBackups = 2;
      const sm = new SaveManager(gameId, 10, maxBackups);

      sm.createSave({ currentEventId: 'ch1' }, 1, 'manual');
      sm.createSave({ currentEventId: 'ch2' }, 2, 'manual');
      sm.createSave({ currentEventId: 'ch3' }, 3, 'manual');

      const backups = sm.getBackups();

      expect(backups.length).toBe(2);
      expect(backups[0].gameData.currentEventId).toBe('ch2');
      expect(backups[1].gameData.currentEventId).toBe('ch3');
    });
  });

  describe('multiple games', () => {
    test('should isolate saves between different games', () => {
      const game1Manager = new SaveManager('game1');
      const game2Manager = new SaveManager('game2');

      game1Manager.createSave({ currentEventId: 'g1-ch1' }, 1, 'manual');
      game2Manager.createSave({ currentEventId: 'g2-ch1' }, 1, 'manual');

      const game1Saves = game1Manager.getAllSaves();
      const game2Saves = game2Manager.getAllSaves();

      expect(game1Saves.length).toBe(1);
      expect(game2Saves.length).toBe(1);
      expect(game1Saves[0].gameData.currentEventId).toBe('g1-ch1');
      expect(game2Saves[0].gameData.currentEventId).toBe('g2-ch1');
    });
  });
});
