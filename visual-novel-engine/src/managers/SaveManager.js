export class SaveManager {
  constructor() {
    this.storageKey = 'vn_save_';
  }

  save(slotName, gameState, gameFolder = null) {
    const saveData = {
      ...gameState.toJSON(),
      gameFolder: gameFolder,
      timestamp: Date.now()
    };
    localStorage.setItem(this.storageKey + slotName, JSON.stringify(saveData));
  }

  load(slotName) {
    const data = localStorage.getItem(this.storageKey + slotName);
    return data ? JSON.parse(data) : null;
  }

  getSaveSlots() {
    const slots = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith(this.storageKey)) {
        const slotName = key.replace(this.storageKey, '');
        const data = JSON.parse(localStorage.getItem(key));
        slots.push({ 
          name: slotName, 
          timestamp: data.timestamp || Date.now(),
          gameFolder: data.gameFolder || 'unknown'
        });
      }
    }
    // Sort by timestamp, most recent first
    return slots.sort((a, b) => b.timestamp - a.timestamp);
  }

  deleteSave(slotName) {
    localStorage.removeItem(this.storageKey + slotName);
  }
}