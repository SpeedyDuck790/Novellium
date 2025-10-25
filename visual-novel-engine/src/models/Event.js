export class Event {
  constructor(id, data) {
    this.id = id;
    this.name = data.name;
    this.type = data.type; // dialogue, narration, scene, choice
    this.background = data.background;
    this.character = data.character; // { id, sprite, position }
    this.dialogue = data.dialogue; // string or { default, conditional[] }
    this.choices = data.choices || []; // [{ text, nextEvent, setFlags, conditions }]
    this.conditions = data.conditions || {}; // { flag: value }
  }

  meetsConditions(flags) {
    return Object.entries(this.conditions).every(
      ([key, value]) => flags[key] === value
    );
  }

  getDialogueText(flags) {
    // If simple string, return it
    if (typeof this.dialogue === 'string') {
      return this.dialogue;
    }

    // Check conditional dialogues
    if (this.dialogue.conditional) {
      for (const cond of this.dialogue.conditional) {
        const meetsConditions = Object.entries(cond.conditions || {}).every(
          ([key, value]) => flags[key] === value
        );
        if (meetsConditions) {
          return cond.text;
        }
      }
    }

    // Return default
    return this.dialogue.default || '';
  }

  getAvailableChoices(flags) {
    return this.choices.filter(choice => {
      if (!choice.conditions) return true;
      return Object.entries(choice.conditions).every(
        ([key, value]) => flags[key] === value
      );
    });
  }
}