export class GameState {
  constructor() {
    this.currentEvent = null;
    this.flags = {}; // All decision tracking
    this.history = []; // Event IDs visited
  }

  setFlag(key, value) {
    this.flags[key] = value;
  }

  getFlag(key) {
    return this.flags[key];
  }

  setCurrentEvent(eventId) {
    this.currentEvent = eventId;
    this.history.push(eventId);
  }

  toJSON() {
    return {
      timestamp: new Date().toISOString(),
      currentEvent: this.currentEvent,
      flags: this.flags,
      history: this.history
    };
  }

  fromJSON(data) {
    this.currentEvent = data.currentEvent;
    this.flags = data.flags || {};
    this.history = data.history || [];
  }
}