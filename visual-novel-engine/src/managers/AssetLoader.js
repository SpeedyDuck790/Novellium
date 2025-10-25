export class AssetLoader {
  constructor(baseFolder) {
    this.baseFolder = baseFolder;
    this.cache = {
      images: new Map(),
      json: new Map()
    };
  }

  async loadJSON(path) {
    if (this.cache.json.has(path)) {
      return this.cache.json.get(path);
    }

    const fullPath = `${this.baseFolder}/${path}`;
    const response = await fetch(fullPath);
    const data = await response.json();
    this.cache.json.set(path, data);
    return data;
  }

  async loadImage(path) {
    if (this.cache.images.has(path)) {
      return this.cache.images.get(path);
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      const fullPath = `${this.baseFolder}/${path}`;
      
      img.onload = () => {
        this.cache.images.set(path, img);
        resolve(img);
      };
      img.onerror = reject;
      img.src = fullPath;
    });
  }

  async preloadImages(paths) {
    const promises = paths.map(path => this.loadImage(path));
    return Promise.all(promises);
  }
}