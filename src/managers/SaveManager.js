// SaveManager v2.0 - With Export/Import functionality
export class SaveManager {
  constructor() {
    this.storageKey = 'vn_save_';
    this.backupFolderKey = 'vn_backup_folder';
    this.autoBackup = true;
  }

  // Save to localStorage and optionally backup to file
  async save(slotName, gameState, gameFolder = null) {
    console.log('SaveManager.save called:', { slotName, gameFolder, autoBackup: this.autoBackup });
    
    const saveData = {
      ...gameState.toJSON(),
      gameFolder: gameFolder,
      timestamp: Date.now()
    };
    
    // Save to localStorage
    localStorage.setItem(this.storageKey + slotName, JSON.stringify(saveData));
    console.log('Saved to localStorage:', slotName);
    
    // Auto-backup to file if enabled
    if (this.autoBackup) {
      console.log('Auto-backup enabled, exporting to file...');
      await this.exportSaveToFile(slotName, saveData);
      console.log('Export completed');
    } else {
      console.log('Auto-backup disabled, skipping file export');
    }
    
    return true;
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

  // Export a single save to downloadable file
  async exportSaveToFile(slotName, saveData = null) {
    console.log('exportSaveToFile called:', slotName);
    
    if (!saveData) {
      saveData = this.load(slotName);
      if (!saveData) {
        console.error('No save data found for:', slotName);
        return false;
      }
    }

    console.log('Creating blob for save:', slotName);
    const blob = new Blob([JSON.stringify(saveData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${slotName}.vnsave`;
    document.body.appendChild(a);
    console.log('Triggering download for:', a.download);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('Download triggered successfully');
    return true;
  }

  // Export all saves as a zip-like bundle
  async exportAllSaves() {
    const allSaves = this.getSaveSlots();
    const exportData = {
      exportDate: new Date().toISOString(),
      saves: {}
    };

    allSaves.forEach(slot => {
      const saveData = this.load(slot.name);
      if (saveData) {
        exportData.saves[slot.name] = saveData;
      }
    });

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `all-saves-${Date.now()}.vnbackup`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return true;
  }

  // Import a single save from file
  async importSaveFromFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const saveData = JSON.parse(e.target.result);
          const slotName = file.name.replace('.vnsave', '');
          localStorage.setItem(this.storageKey + slotName, JSON.stringify(saveData));
          resolve({ name: slotName, success: true });
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  // Import all saves from backup file
  async importAllSaves(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const exportData = JSON.parse(e.target.result);
          let imported = 0;
          
          if (exportData.saves) {
            Object.keys(exportData.saves).forEach(slotName => {
              localStorage.setItem(this.storageKey + slotName, JSON.stringify(exportData.saves[slotName]));
              imported++;
            });
          }
          
          resolve({ imported, success: true });
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  // Check if localStorage has saves
  hasSaves() {
    return this.getSaveSlots().length > 0;
  }

  // Clear all saves
  clearAllSaves() {
    const slots = this.getSaveSlots();
    slots.forEach(slot => {
      this.deleteSave(slot.name);
    });
  }
}