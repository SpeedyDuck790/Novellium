export class Character {
  constructor(id, data) {
    this.id = id;
    this.name = data.name;
    this.sprites = data.sprites; // { happy: "path.png", sad: "path.png" }
    this.details = data.details; // { likes: [], dislikes: [], ... }
  }

  getSprite(emotion) {
    return this.sprites[emotion] || this.sprites.neutral || Object.values(this.sprites)[0];
  }

  getDetail(key) {
    return this.details[key];
  }
}